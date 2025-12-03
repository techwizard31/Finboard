import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { StockQuote } from '@/types/api.types';

interface UseStockQuoteOptions {
  symbol: string;
  provider?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useStockQuote({
  symbol,
  provider = 'alphaVantage',
  refreshInterval = 60000,
  enabled = true,
}: UseStockQuoteOptions) {
  return useQuery<{ data: StockQuote; timestamp: string }>({
    queryKey: ['stock', 'quote', symbol, provider],
    queryFn: () =>
      apiClient.post('/api/finance/quote', {
        symbol,
        provider,
      }),
    refetchInterval: refreshInterval,
    staleTime: 30000,
    enabled: enabled && !!symbol,
    retry: 2,
  });
}