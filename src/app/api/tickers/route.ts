import { NextResponse } from 'next/server';

const MEXC_REST_URL = 'https://api.mexc.com/api/v3';

export async function GET() {
  try {
    const res = await fetch(`${MEXC_REST_URL}/ticker/24hr`, {
      next: { revalidate: 30 }, // ISR cache 30s on the server
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'MEXC API returned an error' },
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
