export type WidgetType = 'table' | 'card' | 'chart';
export type CardType = 'watchlist' | 'gainers' | 'performance' | 'financial';
export type ChartType = 'line' | 'candlestick';
export type ApiProvider = 'alphaVantage' | 'finnhub';
export type ChartInterval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  apiProvider: ApiProvider;
  endpoint: string;
  params: Record<string, any>;
  selectedFields: string[];
  refreshInterval: number;
  createdAt: string;
  config?: WidgetConfig;
}

export interface WidgetConfig {
  cardType?: CardType;
  chartType?: ChartType;
  chartInterval?: ChartInterval;
  symbols?: string[];
  limit?: number;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}