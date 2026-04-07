import { NextRequest, NextResponse } from 'next/server';

const MEXC_REST_URL = 'https://api.mexc.com/api/v3';

// Allowlist of valid intervals — rejects injection attempts
const VALID_INTERVALS = new Set([
  '1m', '5m', '15m', '30m', '60m',
  '4h', '1d', '1W', '1M',
]);

// Must be uppercase alphanumeric only — prevents SSRF path traversal
const SYMBOL_REGEX = /^[A-Z0-9]{2,20}$/;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? 'same-origin',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const rawSymbol = searchParams.get('symbol');
  if (!rawSymbol) {
    return NextResponse.json(
      { error: 'Missing required parameter: symbol' },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  const symbol = rawSymbol.toUpperCase().trim();
  if (!SYMBOL_REGEX.test(symbol)) {
    return NextResponse.json(
      { error: 'Invalid symbol format. Must be alphanumeric uppercase, 2–20 chars.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const rawInterval = searchParams.get('interval') ?? '1d';
  const interval = rawInterval.trim();
  if (!VALID_INTERVALS.has(interval)) {
    return NextResponse.json(
      { error: `Invalid interval. Allowed values: ${[...VALID_INTERVALS].join(', ')}` },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const rawLimit = parseInt(searchParams.get('limit') ?? '365', 10);
  const limit = isNaN(rawLimit) ? 365 : Math.min(Math.max(rawLimit, 1), 1000);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(
      `${MEXC_REST_URL}/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'MEXC klines API returned an error' },
        { status: res.status, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'Upstream request timed out' : 'Failed to connect to MEXC' },
      { status: isTimeout ? 504 : 502, headers: CORS_HEADERS }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'GET' } });
}
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'GET' } });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'GET' } });
}
export async function PATCH() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'GET' } });
}

