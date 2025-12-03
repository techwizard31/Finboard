import { WidgetType, CardType, ChartType } from '@/types/widget.types';

export const WIDGET_TYPES: { value: WidgetType; label: string; description: string }[] = [
  {
    value: 'table',
    label: 'Stock Table',
    description: 'Paginated table with search and filters',
  },
  {
    value: 'card',
    label: 'Finance Card',
    description: 'Watchlist, gainers, or performance data',
  },
  {
    value: 'chart',
    label: 'Stock Chart',
    description: 'Line or candlestick charts',
  },
];

export const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'gainers', label: 'Market Gainers' },
  { value: 'performance', label: 'Performance' },
  { value: 'financial', label: 'Financial Data' },
];

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line Chart' },
  { value: 'candlestick', label: 'Candlestick Chart' },
];

export const REFRESH_INTERVALS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
  { value: 900000, label: '15 minutes' },
  { value: 1800000, label: '30 minutes' },
  { value: 3600000, label: '1 hour' },
];

export const CHART_INTERVALS = [
  { value: '1min', label: '1 Minute' },
  { value: '5min', label: '5 Minutes' },
  { value: '15min', label: '15 Minutes' },
  { value: '30min', label: '30 Minutes' },
  { value: '60min', label: '1 Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];