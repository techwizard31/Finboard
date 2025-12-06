import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Client to Server Events
export interface ClientToServerEvents {
  subscribe: (data: { symbol: string }) => void;
  unsubscribe: (data: { symbol: string }) => void;
  ping: () => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  stockUpdate: (data: StockUpdateData) => void;
  subscribed: (data: { symbol: string }) => void;
  unsubscribed: (data: { symbol: string }) => void;
  error: (data: { message: string; symbol?: string }) => void;
  pong: () => void;
  connected: () => void;
}

// Socket Data
export interface SocketData {
  userId?: string;
  subscriptions: Set<string>;
}

// Stock Update Data
export interface StockUpdateData {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
  change?: number;
  changePercent?: number;
}

// Finnhub WebSocket Message
export interface FinnhubTradeMessage {
  data: Array<{
    s: string;  // symbol
    p: number;  // price
    t: number;  // timestamp
    v: number;  // volume
  }>;
  type: 'trade';
}

// Socket.IO Server Type
export type TypedServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

// Socket.IO Client Socket Type
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;