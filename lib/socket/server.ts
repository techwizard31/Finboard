import WebSocket from 'ws';
import {
  TypedServer,
  TypedSocket,
  FinnhubTradeMessage,
  StockUpdateData,
} from '@/types/socket.types';

// Store Finnhub WebSocket connections per symbol
const finnhubConnections = new Map<string, WebSocket>();

// Store subscription counts per symbol
const subscriptionCounts = new Map<string, number>();

// Track last known prices for each symbol
const lastPrices = new Map<string, number>();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';

// Initialize Socket.IO server with event handlers

export function initializeSocketServer(io: TypedServer) {
  console.log('🔌 Socket.IO server initialized');

  // Handle new client connections
  io.on('connection', (socket: TypedSocket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Initialize socket data
    socket.data.subscriptions = new Set<string>();

    // Send connection confirmation
    socket.emit('connected');

    // Handle subscribe event
    socket.on('subscribe', ({ symbol }) => {
      handleSubscribe(socket, symbol, io);
    });

    // Handle unsubscribe event
    socket.on('unsubscribe', ({ symbol }) => {
      handleUnsubscribe(socket, symbol, io);
    });

    // Handle ping event
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      handleDisconnect(socket, io);
    });
  });
}

// Handle client subscription to a stock symbol
 
function handleSubscribe(socket: TypedSocket, symbol: string, io: TypedServer) {
  try {
    // Validate symbol
    if (!symbol || typeof symbol !== 'string') {
      socket.emit('error', { message: 'Invalid symbol' });
      return;
    }

    const normalizedSymbol = symbol.toUpperCase();

    // Check if already subscribed
    if (socket.data.subscriptions.has(normalizedSymbol)) {
      console.log(`⚠️ Client ${socket.id} already subscribed to ${normalizedSymbol}`);
      return;
    }

    // Add to socket's subscriptions
    socket.data.subscriptions.add(normalizedSymbol);

    // Join socket.io room for this symbol
    socket.join(normalizedSymbol);

    console.log(`📊 Client ${socket.id} subscribed to ${normalizedSymbol}`);

    // Increment subscription count
    const currentCount = subscriptionCounts.get(normalizedSymbol) || 0;
    subscriptionCounts.set(normalizedSymbol, currentCount + 1);

    // If this is the first subscription, connect to Finnhub
    if (currentCount === 0) {
      connectToFinnhub(normalizedSymbol, io);
    }

    // Send confirmation
    socket.emit('subscribed', { symbol: normalizedSymbol });

    // Send last known price if available
    const lastPrice = lastPrices.get(normalizedSymbol);
    if (lastPrice) {
      socket.emit('stockUpdate', {
        symbol: normalizedSymbol,
        price: lastPrice,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error handling subscribe:', error);
    socket.emit('error', { message: 'Failed to subscribe', symbol });
  }
}

 // Handle client unsubscription from a stock symbol

function handleUnsubscribe(socket: TypedSocket, symbol: string, io: TypedServer) {
  try {
    const normalizedSymbol = symbol.toUpperCase();

    // Remove from socket's subscriptions
    socket.data.subscriptions.delete(normalizedSymbol);

    // Leave socket.io room
    socket.leave(normalizedSymbol);

    console.log(`📉 Client ${socket.id} unsubscribed from ${normalizedSymbol}`);

    // Decrement subscription count
    const currentCount = subscriptionCounts.get(normalizedSymbol) || 0;
    const newCount = Math.max(0, currentCount - 1);
    subscriptionCounts.set(normalizedSymbol, newCount);

    // If no more subscribers, disconnect from Finnhub
    if (newCount === 0) {
      disconnectFromFinnhub(normalizedSymbol);
    }

    // Send confirmation
    socket.emit('unsubscribed', { symbol: normalizedSymbol });
  } catch (error) {
    console.error('Error handling unsubscribe:', error);
    socket.emit('error', { message: 'Failed to unsubscribe', symbol });
  }
}

// Handle client disconnect - cleanup all subscriptions
 
function handleDisconnect(socket: TypedSocket, io: TypedServer) {
  socket.data.subscriptions.forEach((symbol) => {
    handleUnsubscribe(socket, symbol, io);
  });
}

// Connect to Finnhub WebSocket for a specific symbol
 
function connectToFinnhub(symbol: string, io: TypedServer) {
  try {
    if (finnhubConnections.has(symbol)) {
      console.log(`⚠️ Already connected to Finnhub for ${symbol}`);
      return;
    }

    console.log(`🔗 Connecting to Finnhub WebSocket for ${symbol}...`);

    const ws = new WebSocket(`${FINNHUB_WS_URL}?token=${FINNHUB_API_KEY}`);

    ws.on('open', () => {
      console.log(`✅ Connected to Finnhub for ${symbol}`);

      // Subscribe to symbol
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: FinnhubTradeMessage = JSON.parse(data.toString());

        if (message.type === 'trade' && message.data) {
          message.data.forEach((trade) => {
            if (trade.s === symbol) {
              const currentPrice = lastPrices.get(symbol);
              const change = currentPrice ? trade.p - currentPrice : 0;
              const changePercent = currentPrice ? ((change / currentPrice) * 100) : 0;

              const stockUpdate: StockUpdateData = {
                symbol: trade.s,
                price: trade.p,
                volume: trade.v,
                timestamp: trade.t,
                change,
                changePercent,
              };

              // Update last known price
              lastPrices.set(symbol, trade.p);

              // Broadcast to all clients in the room
              io.to(symbol).emit('stockUpdate', stockUpdate);

              console.log(`📈 ${symbol}: $${trade.p} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing Finnhub message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error(`❌ Finnhub WebSocket error for ${symbol}:`, error);
      io.to(symbol).emit('error', {
        message: 'WebSocket connection error',
        symbol,
      });
    });

    ws.on('close', () => {
      console.log(`🔌 Finnhub WebSocket closed for ${symbol}`);
      finnhubConnections.delete(symbol);

      // Attempt reconnection if there are still subscribers
      const count = subscriptionCounts.get(symbol) || 0;
      if (count > 0) {
        console.log(`🔄 Reconnecting to Finnhub for ${symbol}...`);
        setTimeout(() => connectToFinnhub(symbol, io), 5000);
      }
    });

    finnhubConnections.set(symbol, ws);
  } catch (error) {
    console.error(`Error connecting to Finnhub for ${symbol}:`, error);
    io.to(symbol).emit('error', {
      message: 'Failed to connect to data provider',
      symbol,
    });
  }
}

// Disconnect from Finnhub WebSocket for a specific symbol
function disconnectFromFinnhub(symbol: string) {
  const ws = finnhubConnections.get(symbol);

  if (ws) {
    console.log(`🔌 Disconnecting from Finnhub for ${symbol}`);

    // Unsubscribe from symbol
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }

    ws.close();
    finnhubConnections.delete(symbol);
    subscriptionCounts.delete(symbol);
    lastPrices.delete(symbol);
  }
}