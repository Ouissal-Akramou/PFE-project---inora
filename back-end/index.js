// index.js - Production Ready for Railway (FULLY FIXED)
import express from 'express';
import cors from 'cors';
import auth from './Routes/auth.js';
import cookieParser from 'cookie-parser';
import reviewRoutes from './Routes/reviews.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Railway provides PORT dynamically

// Get frontend URL from environment or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS configuration for Railway and local development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allowed origins list
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      FRONTEND_URL,
      /\.railway\.app$/,  // Any Railway app domain
      /\.up\.railway\.app$/ // Any Railway production domain
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Important for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware (optional but helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
  next();
});

// Health check endpoint (important for Railway)
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running on Railway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', auth);
app.use('/api/reviews', reviewRoutes);

// ✅ FIXED: 404 handler for undefined routes - removed '*' to avoid path-to-regexp error
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server with IPv6 support (required for Railway internal networking)
const server = app.listen(PORT, '::', () => {
  console.log('=================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🌐 IPv6: Listening on :: (all interfaces)`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;