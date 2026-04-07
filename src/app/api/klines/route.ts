import { NextRequest, NextResponse } from 'next/server';

const MEXC_REST_URL = 'https://api.mexc.com/api/v3';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1d';
  const limit = searchParams.get('limit') || '365';

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${MEXC_REST_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'MEXC klines API error' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to MEXC' },
      { status: 502 }
    );
  }
}
