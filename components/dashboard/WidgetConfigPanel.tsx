'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWidgetStore } from '@/stores/widgetStore';
import { REFRESH_INTERVALS, CHART_INTERVALS } from '@/constants/widgetTypes';

export const WidgetConfigPanel: React.FC = () => {
  const {
    widgets,
    selectedWidgetId,
    isConfigPanelOpen,
    closeConfigPanel,
    updateWidget,
  } = useWidgetStore();

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  const [title, setTitle] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(60000);
  const [symbols, setSymbols] = useState('');
  const [chartInterval, setChartInterval] = useState('5min');

  useEffect(() => {
    if (selectedWidget) {
      setTitle(selectedWidget.title);
      setRefreshInterval(selectedWidget.refreshInterval);
      setSymbols(selectedWidget.config?.symbols?.join(', ') || '');
      setChartInterval(selectedWidget.config?.chartInterval || '5min');
    }
  }, [selectedWidget]);

  if (!isConfigPanelOpen || !selectedWidget) return null;

  const handleSave = () => {
    updateWidget(selectedWidget.id, {
      title,
      refreshInterval,
      config: {
        ...selectedWidget.config,
        symbols: symbols.split(',').map((s) => s.trim()),
        chartInterval: selectedWidget.type === 'chart' ? chartInterval : undefined,
      },
    });
    closeConfigPanel();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeConfigPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Widget Settings
            </h2>
            <button
              onClick={closeConfigPanel}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input
              label="Widget Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select
              label="Refresh Interval"
              value={refreshInterval.toString()}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              options={REFRESH_INTERVALS.map((interval) => ({
                value: interval.value.toString(),
                label: interval.label,
              }))}
            />

            <Input
              label="Stock Symbols"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              placeholder="AAPL, GOOGL, MSFT"
            />

            {selectedWidget.type === 'chart' && (
              <Select
                label="Chart Interval"
                value={chartInterval}
                onChange={(e) => setChartInterval(e.target.value)}
                options={CHART_INTERVALS}
              />
            )}

            <div className="pt-4 space-y-2">
              <Button onClick={handleSave} variant="primary" className="w-full">
                Save Changes
              </Button>
              <Button
                onClick={closeConfigPanel}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};