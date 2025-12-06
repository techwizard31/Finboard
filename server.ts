import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocketServer } from './lib/socket/server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Initialize Socket.IO event handlers
  initializeSocketServer(io);

  // Start server
  httpServer.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 FinBoard Server Started Successfully !               ║
║                                                            ║
║   ➜ Local:    http://localhost:${port}                    ║
║   ➜ Network:  http://${hostname}:${port}                  ║
║                                                            ║ 
║   📡 WebSocket: Socket.IO running on same server          ║     ║                                                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down in a few seconds...');
    io.close(() => {
      console.log('✅ Socket.IO connections closed');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});