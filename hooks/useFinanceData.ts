import { useQuery } from '@tanstack/react-query';
import { Widget } from '@/types/widget.types';
import { apiClient } from '@/services/api/apiClient';
import { cacheManager } from '@/services/cache/cacheManager';

interface UseFinanceDataOptions {
  widget: Widget;
  enabled?: boolean;
}

export function useFinanceData({ widget, enabled = true }: UseFinanceDataOptions) {
  return useQuery({
    queryKey: ['finance', widget.id, widget.endpoint, widget.params],
    queryFn: async () => {
      // Check cache first
      const cacheKey = `${widget.endpoint}-${JSON.stringify(widget.params)}`;
      const cached = cacheManager.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Fetch from API
      const data = await apiClient.post(`/api/finance/${widget.endpoint}`, {
        ...widget.params,
        provider: widget.apiProvider,
      });

      // Cache the result
      cacheManager.set(cacheKey, data, widget.refreshInterval);

      return data;
    },
    refetchInterval: widget.refreshInterval,
    staleTime: Math.min(widget.refreshInterval * 0.8, 30000),
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}