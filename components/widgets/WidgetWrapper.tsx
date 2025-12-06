'use client';

import React from 'react';
import { GripVertical, Settings, Trash2, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useWidgetStore } from '@/stores/widgetStore';
import { Widget } from '@/types/widget.types';
import { StockTable } from './StockTable/StockTable';
import { WatchlistCard } from './FinanceCard/WatchlistCard';
import { GainersCard } from './FinanceCard/GainersCard';
import { PerformanceCard } from './FinanceCard/PerformanceCard';
import { FinancialDataCard } from './FinanceCard/FinancialDataCard';
import { LineChart } from './Charts/LineChart';
import { CandlestickChart } from './Charts/CandlestickChart';
import { formatters } from '@/lib/formatters';

interface WidgetWrapperProps {
  widget: Widget;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget }) => {
  const { removeWidget, selectWidget, openConfigPanel } = useWidgetStore();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this widget?')) {
      removeWidget(widget.id);
    }
  };

  const handleConfig = () => {
    selectWidget(widget.id);
    openConfigPanel();
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'table':
        return <StockTable widget={widget} />;
      case 'card':
        switch (widget.config?.cardType) {
          case 'watchlist':
            return <WatchlistCard widget={widget} />;
          case 'gainers':
            return <GainersCard widget={widget} />;
          case 'performance':
            return <PerformanceCard widget={widget} />;
          case 'financial':
            return <FinancialDataCard widget={widget} />;
          default:
            return <WatchlistCard widget={widget} />;
        }
      case 'chart':
        if (widget.config?.chartType === 'candlestick') {
          return <CandlestickChart widget={widget} />;
        }
        return <LineChart widget={widget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const isRealtimeEnabled = widget.config?.useRealtime || false;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="cursor-move drag-handle">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <CardTitle className="text-base">{widget.title}</CardTitle>
            {isRealtimeEnabled && (
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800">
                <Radio className="w-3 h-3 text-green-600 dark:text-green-400 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  LIVE
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 no-drag">
            <button
              onClick={handleConfig}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>
        <div className=" ml-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
          Last updated: {formatters.time(new Date())}
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto">
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};