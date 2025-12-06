'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatters } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

interface WatchlistCardProps {
  widget: Widget;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ widget }) => {
  const symbols = widget.config?.symbols || ['AAPL', 'GOOGL', 'MSFT'];
  const useRealtime = widget.config?.useRealtime || false;

  return (
    <div className="space-y-3">
      {symbols.map((symbol) => (
        <WatchlistItem
          key={symbol}
          symbol={symbol}
          provider={widget.apiProvider}
          refreshInterval={widget.refreshInterval}
          useRealtime={useRealtime}
        />
      ))}
    </div>
  );
};

interface WatchlistItemProps {
  symbol: string;
  provider: string;
  refreshInterval: number;
  useRealtime: boolean;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({
  symbol,
  provider,
  refreshInterval,
  useRealtime,
}) => {
  // Use realtime or polling based on config
  const pollingData = useStockQuote({
    symbol,
    provider,
    refreshInterval,
    enabled: !useRealtime,
  });

  const realtimeData = useRealtimeStock({
    symbol,
    enabled: useRealtime,
  });

  const { data, isLoading, error } = useRealtime
    ? { data: realtimeData.data ? { data: realtimeData.data, timestamp: new Date().toISOString() } : null, isLoading: !realtimeData.data && !realtimeData.error, error: realtimeData.error }
    : { data: pollingData.data, isLoading: pollingData.isLoading, error: pollingData.error };

  const [isFlashing, setIsFlashing] = React.useState(false);
  const prevPriceRef = React.useRef<number | null>(null);

  // Flash effect on price change
  React.useEffect(() => {
    if (data?.data.price && prevPriceRef.current !== null && prevPriceRef.current !== data.data.price) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 500);
      return () => clearTimeout(timer);
    }
    if (data?.data.price) {
      prevPriceRef.current = data.data.price;
    }
  }, [data?.data.price]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-red-600 dark:text-red-400">
          Error loading {symbol}
        </div>
      </div>
    );
  }

  const stock = data.data;
  const isPositive = stock.change >= 0;

  return (
    <div
      className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
        isFlashing ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stock.symbol}
            </span>
            {useRealtime && realtimeData.isSubscribed && (
              <Radio className="w-3 h-3 text-green-500 animate-pulse" />
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatters.time(new Date(stock.timestamp))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">
            {formatters.currency(stock.price)}
          </div>
          <div
            className={`flex items-center justify-end space-x-1 text-sm font-medium ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatters.percentage(stock.changePercent)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};