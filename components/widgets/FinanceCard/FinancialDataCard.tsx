'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useStockQuote } from '@/hooks/useStockQuote';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatters } from '@/lib/formatters';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

interface FinancialDataCardProps {
  widget: Widget;
}

export const FinancialDataCard: React.FC<FinancialDataCardProps> = ({
  widget,
}) => {
  const symbol = widget.config?.symbols?.[0] || 'AAPL';
  const { data, isLoading } = useStockQuote({
    symbol,
    provider: widget.apiProvider,
    refreshInterval: widget.refreshInterval,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const stock = data.data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Market Price
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
                {formatters.currency(stock.price)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Change
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  stock.change >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatters.percentage(stock.changePercent)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Volume
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
                {formatters.largeNumber(stock.volume || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};