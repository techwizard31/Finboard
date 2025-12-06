'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWidgetStore } from '@/stores/widgetStore';
import { generateId } from '@/lib/utils';
import { Widget, WidgetType, CardType, ChartType } from '@/types/widget.types';
import {
  WIDGET_TYPES,
  CARD_TYPES,
  CHART_TYPES,
  REFRESH_INTERVALS,
  CHART_INTERVALS,
} from '@/constants/widgetTypes';
import { API_PROVIDERS } from '@/constants/apiEndpoints';
import { Radio } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWidget, layout } = useWidgetStore();
  const [step, setStep] = useState(1);
  const [widgetType, setWidgetType] = useState<WidgetType>('table');
  const [title, setTitle] = useState('');
  const [apiProvider, setApiProvider] = useState('alphaVantage');
  const [refreshInterval, setRefreshInterval] = useState(60000);
  const [cardType, setCardType] = useState<CardType>('watchlist');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [chartInterval, setChartInterval] = useState<string>('daily');
  const [symbols, setSymbols] = useState('AAPL');
  const [useRealtime, setUseRealtime] = useState(false);

  const resetForm = () => {
    setStep(1);
    setWidgetType('table');
    setTitle('');
    setApiProvider('alphaVantage');
    setRefreshInterval(60000);
    setCardType('watchlist');
    setChartType('line');
    setChartInterval('daily');
    setSymbols('AAPL');
    setUseRealtime(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !widgetType) return;
    if (step === 2 && !title) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    const widget: Widget = {
      id: generateId(),
      type: widgetType,
      title: title || `New ${widgetType}`,
      apiProvider: apiProvider as any,
      endpoint: widgetType === 'table' ? 'search' : 'quote',
      params: { symbol: symbols },
      selectedFields: [],
      refreshInterval,
      createdAt: new Date().toISOString(),
      config: {
        cardType: widgetType === 'card' ? cardType : undefined,
        chartType: widgetType === 'chart' ? chartType : undefined,
        chartInterval: widgetType === 'chart' ? (chartInterval as any) : undefined,
        symbols: symbols.split(',').map((s) => s.trim()),
        useRealtime: widgetType !== 'table' ? useRealtime : false, // No realtime for tables
      },
    };

    const layoutItem = {
      i: widget.id,
      x: (layout.length * 3) % 12,
      y: Infinity,
      w: widgetType === 'table' ? 12 : widgetType === 'chart' ? 6 : 4,
      h: widgetType === 'table' ? 4 : widgetType === 'chart' ? 3 : 2,
      minW: widgetType === 'table' ? 6 : 3,
      minH: 2,
    };

    addWidget(widget, layoutItem);
    handleClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Select Widget Type
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {WIDGET_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setWidgetType(type.value)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              widgetType === type.value
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {type.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {type.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Configure Widget
      </h3>

      <Input
        label="Widget Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`My ${widgetType} Widget`}
      />
      <Select
        label="API Provider"
        value={apiProvider}
        onChange={(e) => setApiProvider(e.target.value)}
        options={API_PROVIDERS}
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
      {widgetType === 'card' && (
        <Select
          label="Card Type"
          value={cardType}
          onChange={(e) => setCardType(e.target.value as CardType)}
          options={CARD_TYPES}
        />
      )}
      {widgetType === 'chart' && (
        <>
          <Select
            label="Chart Type"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            options={CHART_TYPES}
          />
          <Select
            label="Chart Interval"
            value={chartInterval}
            onChange={(e) => setChartInterval(e.target.value)}
            options={CHART_INTERVALS}
          />
        </>
      )}
      <Input
        label="Stock Symbols"
        value={symbols}
        onChange={(e) => setSymbols(e.target.value)}
        placeholder="AAPL, GOOGL, MSFT"
      />
      {/* Real-time Toggle - Not for table widgets */}
      {widgetType !== 'table' && (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useRealtime}
              onChange={(e) => setUseRealtime(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Enable Real-time Updates
                </span>
                <Radio className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Use WebSocket for instant price updates. Requires Finnhub API.
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Review & Confirm
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Type:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {WIDGET_TYPES.find((t) => t.value === widgetType)?.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Title:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {title || `New ${widgetType}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Provider:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {API_PROVIDERS.find((p) => p.value === apiProvider)?.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Refresh:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {REFRESH_INTERVALS.find((i) => i.value === refreshInterval)?.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Symbols:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {symbols}
          </span>
        </div>
        {widgetType !== 'table' && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Real-time:</span>
            <div className="flex items-center space-x-2">
              {useRealtime && (
                <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              )}
              <span
                className={`font-medium ${
                  useRealtime
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                {useRealtime ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Widget"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={step === 1 ? handleClose : handleBack}
            variant="secondary"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={step === 3 ? handleSubmit : handleNext}
            variant="primary"
            disabled={step === 1 && !widgetType}
          >
            {step === 3 ? 'Add Widget' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};