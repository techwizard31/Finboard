'use client';

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { StockUpdateData } from '@/types/socket.types';
import { StockQuote } from '@/types/api.types';

interface UseRealtimeStockOptions {
  symbol: string;
  enabled?: boolean;
}

interface UseRealtimeStockReturn {
  data: StockQuote | null;
  isConnected: boolean;
  isSubscribed: boolean;
  error: string | null;
  lastUpdate: number | null;
}

// React hook for real-time stock data via WebSocket

export function useRealtimeStock({
  symbol,
  enabled = true,
}: UseRealtimeStockOptions): UseRealtimeStockReturn {
  const { socket, isConnected, error: socketError } = useSocket();
  const queryClient = useQueryClient();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [data, setData] = useState<StockQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track if we've subscribed to prevent duplicate subscriptions
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!socket || !isConnected || !enabled || !symbol) {
      return;
    }

    const normalizedSymbol = symbol.toUpperCase();

    // Subscribe to symbol
    const subscribe = () => {
      if (subscribedRef.current) return;

      console.log(`📡 Subscribing to ${normalizedSymbol} via WebSocket`);
      socket.emit('subscribe', { symbol: normalizedSymbol });
      subscribedRef.current = true;
    };

    // Handle subscription confirmation
    const handleSubscribed = (data: { symbol: string }) => {
      if (data.symbol === normalizedSymbol) {
        console.log(`✅ Subscribed to ${normalizedSymbol}`);
        setIsSubscribed(true);
        setError(null);
      }
    };

    // Handle stock updates
    const handleStockUpdate = (update: StockUpdateData) => {
      if (update.symbol === normalizedSymbol) {
        console.log(`📊 Update for ${normalizedSymbol}:`, update);

        // Create StockQuote object
        const stockQuote: StockQuote = {
          symbol: update.symbol,
          price: update.price,
          change: update.change || 0,
          changePercent: update.changePercent || 0,
          volume: update.volume || 0,
          high: update.price, // We don't get these from real-time feed
          low: update.price,
          open: update.price,
          previousClose: update.price - (update.change || 0),
          timestamp: new Date(update.timestamp).toISOString(),
        };

        setData(stockQuote);
        setLastUpdate(Date.now());

        // Update TanStack Query cache
        queryClient.setQueryData(
          ['stock', 'quote', normalizedSymbol],
          {
            data: stockQuote,
            timestamp: new Date().toISOString(),
            source: 'websocket',
          }
        );
      }
    };

    // Handle errors
    const handleError = (data: { message: string; symbol?: string }) => {
      if (data.symbol === normalizedSymbol || !data.symbol) {
        console.error(`❌ Error for ${normalizedSymbol}:`, data.message);
        setError(data.message);
      }
    };

    // Handle unsubscribe confirmation
    const handleUnsubscribed = (data: { symbol: string }) => {
      if (data.symbol === normalizedSymbol) {
        console.log(`✅ Unsubscribed from ${normalizedSymbol}`);
        setIsSubscribed(false);
        subscribedRef.current = false;
      }
    };

    // Attach event listeners
    socket.on('subscribed', handleSubscribed);
    socket.on('stockUpdate', handleStockUpdate);
    socket.on('error', handleError);
    socket.on('unsubscribed', handleUnsubscribed);

    // Subscribe
    subscribe();

    // Cleanup
    return () => {
      console.log(`🔌 Unsubscribing from ${normalizedSymbol}`);
      socket.emit('unsubscribe', { symbol: normalizedSymbol });
      socket.off('subscribed', handleSubscribed);
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('error', handleError);
      socket.off('unsubscribed', handleUnsubscribed);
      subscribedRef.current = false;
      setIsSubscribed(false);
    };
  }, [socket, isConnected, enabled, symbol, queryClient]);

  return {
    data,
    isConnected,
    isSubscribed,
    error: error || socketError,
    lastUpdate,
  };
}