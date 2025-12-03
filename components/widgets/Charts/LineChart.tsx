'use client';

import React from 'react';
import { Widget } from '@/types/widget.types';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatters } from '@/lib/formatters';
import { format } from 'date-fns';

interface LineChartProps {
  widget: Widget;
}

export const LineChart: React.FC<LineChartProps> = ({ widget }) => {
  const symbol = widget.config?.symbols?.[0] || 'AAPL';
  const interval = widget.config?.chartInterval || '5min';

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
    price: point.close,
    volume: point.volume,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {symbol} - {interval}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Price Chart
          </div>
        </div>
        {chartData.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(chartData[chartData.length - 1].price)}
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={chartData}>
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
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(date) => {
              try {
                return format(new Date(date), 'MMM dd, yyyy HH:mm');
              } catch {
                return date;
              }
            }}
            formatter={(value: number) => [formatters.currency(value), 'Price']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Price"
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>

      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">High</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(
                Math.max(...chartData.map((d) => d.price))
              )}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400 mb-1">Low</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
              {formatters.currency(
                Math.min(...chartData.map((d) => d.price))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};