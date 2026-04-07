import { NextResponse } from 'next/server';

const MEXC_REST_URL = 'https://api.mexc.com/api/v3';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? 'same-origin',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${MEXC_REST_URL}/ticker/24hr`, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'MEXC API returned an error' },
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
