import { NextRequest, NextResponse } from 'next/server';

// Server-only — never expose to the client
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const DEFAULT_QUERY = 'cryptocurrency OR bitcoin OR ethereum';
const MAX_QUERY_LENGTH = 200;
// Allows letters, numbers, spaces, and NewsAPI boolean operators
const SAFE_QUERY_REGEX = /^[a-zA-Z0-9\s\-_.,'"()&|:+]+$/;

function sanitizeQuery(raw: string | null): string {
  if (!raw || raw.trim().length === 0) return DEFAULT_QUERY;
  const trimmed = raw.trim().slice(0, MAX_QUERY_LENGTH);
  if (!SAFE_QUERY_REGEX.test(trimmed)) return DEFAULT_QUERY;
  return trimmed;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? 'same-origin',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
};

export async function GET(request: NextRequest) {
  if (!NEWS_API_KEY) {
    console.error('[API /news] NEWS_API_KEY is not configured');
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = sanitizeQuery(searchParams.get('q'));

  const params = new URLSearchParams({
    q: query,
    sortBy: 'publishedAt',
    language: 'en',
    pageSize: '6',
    apiKey: NEWS_API_KEY,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${NEWS_API_URL}?${params}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'News service returned an error', code: res.status },
        { status: res.status, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'News service timed out' : 'Failed to connect to news service' },
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

