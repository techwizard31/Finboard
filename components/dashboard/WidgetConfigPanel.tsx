'use client';

import React, { useState, useEffect } from 'react';
import { X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWidgetStore } from '@/stores/widgetStore';
import { useSocket } from '@/hooks/useSocket';
import { REFRESH_INTERVALS, CHART_INTERVALS } from '@/constants/widgetTypes';
import { ChartInterval } from '@/types/widget.types';

export const WidgetConfigPanel: React.FC = () => {
  const {
    widgets,
    selectedWidgetId,
    isConfigPanelOpen,
    closeConfigPanel,
    updateWidget,
  } = useWidgetStore();

  const { isConnected } = useSocket();

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  const [title, setTitle] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(60000);
  const [symbols, setSymbols] = useState('');
  const [chartInterval, setChartInterval] = useState('5min');
  const [useRealtime, setUseRealtime] = useState(false);

  useEffect(() => {
    if (selectedWidget) {
      setTitle(selectedWidget.title);
      setRefreshInterval(selectedWidget.refreshInterval);
      setSymbols(selectedWidget.config?.symbols?.join(', ') || '');
      setChartInterval(selectedWidget.config?.chartInterval || '5min');
      setUseRealtime(selectedWidget.config?.useRealtime || false);
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
        chartInterval: selectedWidget.type === 'chart' ? (chartInterval as ChartInterval) : undefined,
        useRealtime: selectedWidget.type !== 'table' ? useRealtime : false,
      },
    });
    closeConfigPanel();
  };

  const canUseRealtime = selectedWidget.type !== 'table';

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

            {/* Real-time Toggle */}
            {canUseRealtime && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Real-time Updates
                </label>
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useRealtime}
                      onChange={(e) => setUseRealtime(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={!isConnected}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Enable WebSocket Updates
                        </span>
                        {useRealtime && isConnected && (
                          <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isConnected
                          ? 'Get instant price updates via WebSocket connection.'
                          : 'WebSocket connection not available. Please check your connection.'}
                      </p>
                      {!isConnected && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Disconnected - Real-time updates unavailable</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  WebSocket Status
                </span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isConnected
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

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