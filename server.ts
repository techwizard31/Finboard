import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file in development, Heroku uses Config Vars
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import WebSocket from 'ws';
import {
  TypedServer,
  TypedSocket,
  FinnhubTradeMessage,
  StockUpdateData,
} from './types/socket.types.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });

// Store Finnhub WebSocket connections per symbol
const finnhubConnections = new Map<string, WebSocket>();

// Store subscription counts per symbol
const subscriptionCounts = new Map<string, number>();

// Track last known prices for each symbol
const lastPrices = new Map<string, number>();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';

// Validate API key on server start
if (!FINNHUB_API_KEY) {
  console.error('⚠️  WARNING: FINNHUB_API_KEY is not set in environment variables!');
  console.error('⚠️  Real-time updates will not work. Please add FINNHUB_API_KEY to .env.local');
}

// Initialize Socket.IO server with event handlers

export function initializeSocketServer(io: TypedServer) {
  console.log('🔌 Socket.IO server initialized');

  if (!FINNHUB_API_KEY) {
    console.log('⚠️  Finnhub API key missing - real-time updates disabled');
  }

  // Handle new client connections
  io.on('connection', (socket: TypedSocket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Initialize socket data
    socket.data.subscriptions = new Set<string>();

    // Send connection confirmation
    socket.emit('connected');

    // If no API key, inform client
    if (!FINNHUB_API_KEY) {
      socket.emit('error', {
        message: 'Real-time updates unavailable: Finnhub API key not configured',
      });
    }

    // Handle subscribe event
    socket.on('subscribe', ({ symbol }) => {
      if (!FINNHUB_API_KEY) {
        socket.emit('error', {
          message: 'Cannot subscribe: Finnhub API key not configured',
          symbol,
        });
        return;
      }
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
    if (!FINNHUB_API_KEY) {
      console.error('❌ Cannot connect to Finnhub: API key not configured');
      io.to(symbol).emit('error', {
        message: 'Real-time updates unavailable: API key not configured',
        symbol,
      });
      return;
    }

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

              console.log(`📈 ${symbol}: $${trade.p.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing Finnhub message:', error);
      }
    });

    ws.on('error', (error: Error) => {
      console.error(`❌ Finnhub WebSocket error for ${symbol}:`, error.message);
      
      // Check if it's a 401 error
      if (error.message.includes('401')) {
        console.error('❌ AUTHENTICATION FAILED: Invalid Finnhub API key');
        console.error('❌ Please check your FINNHUB_API_KEY in .env.local');
        
        io.to(symbol).emit('error', {
          message: 'Authentication failed: Invalid API key',
          symbol,
        });
        
        // Don't retry on 401 - it won't help
        finnhubConnections.delete(symbol);
        subscriptionCounts.delete(symbol);
        return;
      }
      
      io.to(symbol).emit('error', {
        message: 'WebSocket connection error',
        symbol,
      });
    });

    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`🔌 Finnhub WebSocket closed for ${symbol} (code: ${code}, reason: ${reason.toString()})`);
      finnhubConnections.delete(symbol);

      // Don't attempt reconnection if it was a 401 error
      if (code === 1002 || code === 1006) {
        console.log('❌ Not reconnecting due to authentication failure');
        subscriptionCounts.delete(symbol);
        return;
      }

      // Attempt reconnection if there are still subscribers
      const count = subscriptionCounts.get(symbol) || 0;
      if (count > 0) {
        console.log(`🔄 Reconnecting to Finnhub for ${symbol} in 5 seconds...`);
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

// Start the server
async function startServer() {
  try {
    const requestHandler = app.getRequestHandler();
    await app.prepare();

    // Create HTTP server
    const httpServer = createServer(async (req, res) => {
      try {
        await requestHandler(req, res);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });

    // Initialize Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    }) as TypedServer;

    // Initialize Socket.IO server with event handlers
    initializeSocketServer(io);

    // Start listening
    httpServer.listen(port, hostname, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`   - Environment: ${dev ? 'Development' : 'Production'}`);
      console.log(`   - Next.js: Ready`);
      console.log(`   - Socket.IO: Ready`);
      console.log(`   - Finnhub API: ${FINNHUB_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();