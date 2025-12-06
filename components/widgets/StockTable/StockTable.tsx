'use client';

import React, { useState } from 'react';
import { Widget } from '@/types/widget.types';
import { useStockQuote } from '@/hooks/useStockQuote';
import { useRealtimeStock } from '@/hooks/useRealtimeStock';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatters } from '@/lib/formatters';
import { ArrowUp, ArrowDown, Radio } from 'lucide-react';
import { TableFilters } from './TableFilters';
import { TablePagination } from './TablePagination';

interface StockTableProps {
  widget: Widget;
}

export const StockTable: React.FC<StockTableProps> = ({ widget }) => {
  const symbols = widget.config?.symbols || ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter symbols based on search
  const filteredSymbols = symbols.filter((symbol) =>
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSymbols = filteredSymbols.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const useRealtime = widget.config?.useRealtime || false;

  return (
    <div className="space-y-4">
      <TableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Symbol
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Price
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Change
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Change %
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSymbols.map((symbol) => (
              <StockTableRow
                key={symbol}
                symbol={symbol}
                provider={widget.apiProvider}
                refreshInterval={widget.refreshInterval}
                useRealtime={useRealtime}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredSymbols.length > itemsPerPage && (
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredSymbols.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {filteredSymbols.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No stocks found
        </div>
      )}
    </div>
  );
};

interface StockTableRowProps {
  symbol: string;
  provider: string;
  refreshInterval: number;
  useRealtime: boolean;
}

const StockTableRow: React.FC<StockTableRowProps> = ({
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
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-3 px-4" colSpan={5}>
          <LoadingSpinner size="sm" />
        </td>
      </tr>
    );
  }

  if (error || !data) {
    return (
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-3 px-4 text-gray-500" colSpan={5}>
          Error loading {symbol}
        </td>
      </tr>
    );
  }

  const stock = data.data;
  const isPositive = stock.change >= 0;

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${
        isFlashing ? 'bg-blue-100 dark:bg-blue-900/20' : ''
      }`}
    >
      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
        <div className="flex items-center space-x-2">
          {useRealtime && realtimeData.isSubscribed && (
            <Radio className="w-3 h-3 text-green-500 animate-pulse" />
          )}
          <span>{stock.symbol}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-gray-100">
        {formatters.currency(stock.price)}
      </td>
      <td className="py-3 px-4 text-right">
        <span
          className={`flex items-center justify-end space-x-1 ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span className="font-mono">{formatters.currency(Math.abs(stock.change))}</span>
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <span
          className={`font-mono ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatters.percentage(stock.changePercent)}
        </span>
      </td>
      <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">
        {formatters.largeNumber(stock.volume)}
      </td>
    </tr>
  );
};