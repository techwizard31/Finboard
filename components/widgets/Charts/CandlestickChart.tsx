'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatters } from '@/lib/formatters';
import { format } from 'date-fns';

interface CandlestickChartProps {
  widget: Widget;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  widget,
}) => {
  const symbol = widget.config?.symbols?.[0] || 'AAPL';
  const interval = widget.config?.chartInterval || 'daily';

  const { data, isLoading, error, refetch } = useHistoricalData({
    symbol,
    interval,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState error={error as Error} retry={refetch} />;
  }

  const chartData = data.data.map((point) => ({
    date: point.date,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
    range: [point.low, point.high],
    body: [
      Math.min(point.open, point.close),
      Math.max(point.open, point.close),
    ],
    isPositive: point.close >= point.open,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {format(new Date(data.date), 'MMM dd, yyyy HH:mm')}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600 dark:text-gray-400">Open:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatters.currency(data.open)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600 dark:text-gray-400">High:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatters.currency(data.high)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600 dark:text-gray-400">Low:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatters.currency(data.low)}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600 dark:text-gray-400">Close:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatters.currency(data.close)}
              </span>
            </div>
            <div className="flex justify-between space-x-4 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Volume:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {formatters.largeNumber(data.volume)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {symbol} - {interval}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Candlestick Chart
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(chartData[chartData.length - 1].close)}
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              try {
                return format(new Date(date), 'HH:mm');
              } catch {
                return date;
              }
            }}
            tick={{ fill: '#9ca3af' }}
            stroke="#9ca3af"
          />
          <YAxis
            tickFormatter={(value) => formatters.currency(value)}
            tick={{ fill: '#9ca3af' }}
            stroke="#9ca3af"
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Wicks (High-Low range) */}
          <Bar dataKey="range" fill="transparent">
            {chartData.map((entry, index) => (
              <Cell
                key={`wick-${index}`}
                stroke={entry.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={1}
              />
            ))}
          </Bar>

          {/* Candle Bodies */}
          <Bar dataKey="body" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell
                key={`body-${index}`}
                fill={entry.isPositive ? '#10b981' : '#ef4444'}
                stroke={entry.isPositive ? '#059669' : '#dc2626'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>

      {chartData.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Open</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(chartData[0].open)}
            </div>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">High</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(
                Math.max(...chartData.map((d) => d.high))
              )}
            </div>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Low</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(
                Math.min(...chartData.map((d) => d.low))
              )}
            </div>
          </div>
          <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Close</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(
                chartData[chartData.length - 1].close
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};