import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { MarketGainer } from '@/types/api.types';

interface UseMarketGainersOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useMarketGainers({
  refreshInterval = 300000,
  enabled = true,
}: UseMarketGainersOptions = {}) {
  return useQuery<{ data: MarketGainer[]; timestamp: string }>({
    queryKey: ['market', 'gainers'],
    queryFn: () => apiClient.get('/api/finance/gainers'),
    refetchInterval: refreshInterval,
    staleTime: 60000,
    enabled,
    retry: 2,
  });
}