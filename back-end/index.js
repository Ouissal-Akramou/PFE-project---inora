import express from 'express';
import cors from 'cors';
import { createServer } from 'http';         
import { Server } from 'socket.io';            
import cron from 'node-cron';                  
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import paymentRoutes from './Routes/payment.js';

// Routes
import auth from './Routes/auth.js';
import reviewRoutes from './Routes/reviews.js';
import profile from './Routes/profile.js';
import bookingRoutes from './Routes/booking.js';
// import chat from './Routes/chat.js';        

// Prisma for chat features
import { prisma } from './lib/prisma.js';      

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const httpServer = createServer(app);          
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Socket.io setup
const io = new Server(httpServer, {            
  cors: { 
    origin: FRONTEND_URL, 
    credentials: true 
  }
});

app.set('io', io);                              

// Socket.io events
io.on('connection', (socket) => {               
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('join_admin', () => {
    socket.join('admins');
    console.log('🛡️ Admin joined admins room');
  });

  socket.on('typing', ({ convoId, userId }) => {
    socket.to('admins').to(`user_${userId}`).emit('typing', { convoId });
  });

  socket.on('stop_typing', ({ convoId, userId }) => {
    socket.to('admins').to(`user_${userId}`).emit('stop_typing', { convoId });
  });

  // ... rest of socket events
});

// Cron job to auto-close inactive conversations (48h)
cron.schedule('0 * * * *', async () => {        // ← zid mn Hasna
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await prisma.conversation.updateMany({
    where: { status: 'OPEN', updatedAt: { lt: cutoff } },
    data: { status: 'CLOSED' }
  });
  console.log('🧹 Closed inactive conversations');
});

// CORS configuration 
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://pleasant-enthusiasm-production-0c41.up.railway.app',
      'http://localhost:3001',
      FRONTEND_URL,
      /\.railway\.app$/,
      /\.up\.railway\.app$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/api/payment', paymentRoutes);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoints 
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running on Railway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes 
app.use('/api/auth', auth);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profile);
app.use('/api/bookings', bookingRoutes);
// app.use('/api/chat', chat);  // ← uncomment when chat route is ready

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server with httpServer 
httpServer.listen(PORT, '::', () => {
  console.log('=================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔌 Socket.io enabled`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;