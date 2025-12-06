import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { HistoricalDataPoint } from '@/types/api.types';

interface UseHistoricalDataOptions {
  symbol: string;
  interval?: string;
  enabled?: boolean;
}

export function useHistoricalData({
  symbol,
  interval = 'daily',
  enabled = true,
}: UseHistoricalDataOptions) {
  return useQuery<{ data: HistoricalDataPoint[]; timestamp: string }>({
    queryKey: ['stock', 'historical', symbol, interval],
    queryFn: () =>
      apiClient.post('/api/finance/historical', {
        symbol,
        interval,
      }),
    staleTime: 300000, // 5 minutes
    enabled: enabled && !!symbol,
    retry: 2,
  });
}