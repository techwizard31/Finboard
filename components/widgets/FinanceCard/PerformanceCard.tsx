'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatters } from '@/lib/formatters';
import { Radio } from 'lucide-react';

interface PerformanceCardProps {
  widget: Widget;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ widget }) => {
  const symbol = widget.config?.symbols?.[0] || 'AAPL';
  const useRealtime = widget.config?.useRealtime || false;

  // Use realtime or polling based on config
  const pollingData = useStockQuote({
    symbol,
    provider: widget.apiProvider,
    refreshInterval: widget.refreshInterval,
    enabled: !useRealtime,
  });

  const realtimeData = useRealtimeStock({
    symbol,
    enabled: useRealtime,
  });

  const { data, isLoading } = useRealtime
    ? { data: realtimeData.data ? { data: realtimeData.data, timestamp: new Date().toISOString() } : null, isLoading: !realtimeData.data && !realtimeData.error }
    : { data: pollingData.data, isLoading: pollingData.isLoading };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const stock = data.data;

  const metrics = [
    { label: 'Current Price', value: formatters.currency(stock.price) },
    { label: 'Open', value: formatters.currency(stock.open) },
    { label: 'High', value: formatters.currency(stock.high) },
    { label: 'Low', value: formatters.currency(stock.low) },
    { label: 'Previous Close', value: formatters.currency(stock.previousClose) },
    { label: 'Volume', value: formatters.largeNumber(stock.volume || 0) },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center py-4 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stock.symbol}
          </span>
          {useRealtime && realtimeData.isSubscribed && (
            <Radio className="w-3 h-3 text-green-500 animate-pulse" />
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono">
          {formatters.currency(stock.price)}
        </div>
        <div
          className={`text-lg font-medium ${
            stock.change >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatters.percentage(stock.changePercent)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {metric.label}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};