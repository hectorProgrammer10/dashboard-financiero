'use client';

import useSWR from 'swr';

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const fetcher = async (url: string): Promise<NewsApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch news');
  }
  return res.json();
};

export function useNewsApi(query?: string) {
  const url = query ? `/api/news?q=${encodeURIComponent(query)}` : '/api/news';
  const { data, error, isLoading, mutate } = useSWR<NewsApiResponse>(
    url,
    fetcher,
    {
      refreshInterval: 300_000, // Re-fetch every 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      errorRetryCount: 2,
    }
  );

  return {
    articles: data?.articles ?? [],
    error,
    isLoading,
    retry: () => mutate(),
  };
}
