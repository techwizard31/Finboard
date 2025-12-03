export const API_ENDPOINTS = {
  alphaVantage: {
    quote: 'GLOBAL_QUOTE',
    search: 'SYMBOL_SEARCH',
    timeSeries: 'TIME_SERIES_INTRADAY',
    dailySeries: 'TIME_SERIES_DAILY',
    gainers: 'TOP_GAINERS_LOSERS',
  },
  finnhub: {
    quote: 'quote',
    search: 'search',
    candles: 'stock/candle',
    profile: 'stock/profile2',
  },
};

export const API_PROVIDERS = [
  { value: 'alphaVantage', label: 'Alpha Vantage' },
  { value: 'finnhub', label: 'Finnhub' },
];