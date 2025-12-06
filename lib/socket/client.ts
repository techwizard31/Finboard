'use client';

import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socket.types';

// Typed Socket.IO client
type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Socket URL
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Create singleton socket instance
let socket: TypedClientSocket | null = null;

// Get or create Socket.IO client instance

export function getSocket(): TypedClientSocket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      autoConnect: true,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    socket.on('error', (data) => {
      console.error('❌ Socket.IO error:', data);
    });
  }

  return socket;
}

// Disconnect socket (cleanup)

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}