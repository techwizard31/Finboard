'use client';

import React from 'react';
import { GripVertical, Settings, Trash2, RefreshCw } from 'lucide-react';
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this widget?')) {
      removeWidget(widget.id);
    }
  };

  const handleConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 flex-1 cursor-move drag-handle">
            <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
            <CardTitle className="text-base truncate">{widget.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleConfig}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative z-10"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer relative z-10"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 cursor-move drag-handle pl-2">
          Last updated: {formatters.time(new Date())}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};