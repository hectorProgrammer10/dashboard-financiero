import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_API_KEY_HERE';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'cryptocurrency OR bitcoin OR ethereum';

    const params = new URLSearchParams({
      q: query,
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: '6', // Fetch a few extras in case some lack images
      apiKey: NEWS_API_KEY,
    });

    const res = await fetch(`${NEWS_API_URL}?${params}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes on the server
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: body.message || 'NewsAPI returned an error' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to NewsAPI' },
      { status: 502 }
    );
  }
}
