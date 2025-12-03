'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useStockQuote } from '@/hooks/useStockQuote';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatters } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistCardProps {
  widget: Widget;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ widget }) => {
  const symbols = widget.config?.symbols || ['AAPL', 'GOOGL', 'MSFT'];

  return (
    <div className="space-y-3">
      {symbols.map((symbol) => (
        <WatchlistItem
          key={symbol}
          symbol={symbol}
          provider={widget.apiProvider}
          refreshInterval={widget.refreshInterval}
        />
      ))}
    </div>
  );
};

interface WatchlistItemProps {
  symbol: string;
  provider: string;
  refreshInterval: number;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({
  symbol,
  provider,
  refreshInterval,
}) => {
  const { data, isLoading, error } = useStockQuote({
    symbol,
    provider,
    refreshInterval,
  });

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
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {stock.symbol}
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