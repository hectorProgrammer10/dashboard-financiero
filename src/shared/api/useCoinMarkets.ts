import useSWR from 'swr';
import { Asset } from '../store/useStore';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});

// Using a free, rate-limited endpoint. We refresh only every 30s.
const COINGECKO_API = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`;

export function useCoinMarkets() {
  const { data, error, isLoading, mutate } = useSWR<Asset[]>(
    COINGECKO_API,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: false,
    } // Options to avoid rate limiting
  );

  return {
    coins: data,
    isLoading,
    isError: error,
    mutate
  };
}
