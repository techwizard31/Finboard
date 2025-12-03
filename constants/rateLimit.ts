export const RATE_LIMITS = {
  alphaVantage: {
    requestsPerMinute: 5,
    requestsPerDay: 500,
  },
  finnhub: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
  },
};