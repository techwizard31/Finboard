'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socket.types';

type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketReturn {
  socket: TypedClientSocket | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * React hook for Socket.IO connection
 */
export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<TypedClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get socket instance
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Connection handlers
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
    };

    // Attach event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('error', handleError);

    // Set initial connection state
    setIsConnected(socketInstance.connected);

    // Cleanup
    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('error', handleError);
    };
  }, []);

  return { socket, isConnected, error };
}