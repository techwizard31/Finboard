'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useMarketGainers } from '@/hooks/useMarketGainers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatters } from '@/lib/formatters';
import { TrendingUp } from 'lucide-react';

interface GainersCardProps {
  widget: Widget;
}

export const GainersCard: React.FC<GainersCardProps> = ({ widget }) => {
  const { data, isLoading, error, refetch } = useMarketGainers({
    refreshInterval: widget.refreshInterval,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState error={error as Error} retry={refetch} />;
  }

  const gainers = data.data.slice(0, 5);

  return (
    <div className="space-y-3">
      {gainers.map((stock, index) => (
        <div
          key={stock.symbol}
          className="p-4 rounded-lg bg-linear-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {stock.symbol}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stock.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {formatters.currency(stock.price)}
              </div>
              <div className="flex items-center justify-end space-x-1 text-sm font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span>{formatters.percentage(stock.changePercent)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};