import { Widget } from '@/types/widget.types';

export function validateWidget(data: unknown): Widget {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid widget data: must be an object');
  }

  const widget = data as any;

  if (!widget.id || typeof widget.id !== 'string') {
    throw new Error('Widget must have a valid string id');
  }

  if (!['table', 'card', 'chart'].includes(widget.type)) {
    throw new Error('Invalid widget type: must be table, card, or chart');
  }

  if (!widget.title || typeof widget.title !== 'string') {
    throw new Error('Widget must have a valid string title');
  }

  if (!['alphaVantage', 'finnhub'].includes(widget.apiProvider)) {
    throw new Error('Invalid API provider');
  }

  if (!widget.endpoint || typeof widget.endpoint !== 'string') {
    throw new Error('Widget must have a valid endpoint');
  }

  if (!widget.params || typeof widget.params !== 'object') {
    throw new Error('Widget params must be an object');
  }

  if (!Array.isArray(widget.selectedFields)) {
    throw new Error('Selected fields must be an array');
  }

  if (typeof widget.refreshInterval !== 'number' || widget.refreshInterval < 0) {
    throw new Error('Refresh interval must be a positive number');
  }

  return widget as Widget;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateApiKey(key: string): boolean {
  return key.length >= 16 && /^[A-Za-z0-9]+$/.test(key);
}