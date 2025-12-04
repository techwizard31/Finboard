export const formatters = {
  currency: (value: number | null | undefined, currency: string = 'USD'): string => {
    if (value == null || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  percentage: (value: number | null | undefined, decimals: number = 2): string => {
    if (value == null || isNaN(value)) return '0.00%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  },

  largeNumber: (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return '0';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  },

  number: (value: number | null | undefined, decimals: number = 0): string => {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  dateTime: (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(date));
    } catch {
      return 'Invalid Date';
    }
  },

  date: (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(date));
    } catch {
      return 'Invalid Date';
    }
  },

  time: (date: string | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(date));
    } catch {
      return 'Invalid Time';
    }
  },
};