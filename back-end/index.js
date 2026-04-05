import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// Routes
import auth from './Routes/auth.js';
import reviewRoutes from './Routes/reviews.js';
import profile from './Routes/profile.js';
import bookingRoutes from './Routes/booking.js';
import notificationsRouter from './Routes/notifications.js';
import paymentRoutes from './Routes/payment.js';
import draftsRouter from './Routes/drafts.js';

// Prisma
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gleaming-trust-production-e46f.up.railway.app';

// ── HTTP + Socket.io ─────────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, credentials: true }
});

app.set('io', io);

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
});

// ── CRON 1 — auto-close inactive conversations (every hour) ──────
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await prisma.conversation.updateMany({
      where: { status: 'OPEN', updatedAt: { lt: cutoff } },
      data: { status: 'CLOSED' },
    });
    console.log(`🧹 Closed ${result.count} inactive conversations`);
  } catch (err) {
    console.error('❌ Conversation cron error:', err.message);
  }
});

// ── CRON 2 — auto-complete bookings when end time is reached (every 15 min) ──
cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        paymentStatus: 'PAID',
        date: { not: null },
        timeSlot: { not: null },
      },
      select: { id: true, date: true, timeSlot: true, userId: true, activity: true },
    });

    const toComplete = bookings.filter(b => {
      const endStr = b.timeSlot.split(/[–—-]/).pop().trim();
      const [h, m] = endStr.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return false;

      const endDate = new Date(b.date);
      endDate.setHours(h, m, 0, 0);
      return now >= endDate;
    });

    if (toComplete.length === 0) return;

    const ids = toComplete.map(b => b.id);

    await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: { status: 'completed' },
    });

    const existingReviews = await prisma.review.findMany({
      where: { bookingId: { in: ids } },
      select: { bookingId: true },
    });
    const alreadyReviewed = new Set(existingReviews.map(r => r.bookingId));

    const existingNotifs = await prisma.notification.findMany({
      where: { bookingId: { in: ids }, type: 'FEEDBACK_REQUEST' },
      select: { bookingId: true },
    });
    const alreadyNotified = new Set(existingNotifs.map(n => n.bookingId));

    const notifications = toComplete
      .filter(b => b.userId && !alreadyReviewed.has(b.id) && !alreadyNotified.has(b.id))
      .map(b => ({
        userId: b.userId,
        bookingId: b.id,
        type: 'FEEDBACK_REQUEST',
        title: '✨ How was your experience?',
        message: `Your "${b.activity || 'session'}" just ended. Share your thoughts — it helps our community grow.`,
        actionUrl: `/reviews/new?bookingId=${b.id}`,
        read: false,
      }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });

      notifications.forEach(n => {
        io.to(`user_${n.userId}`).emit('notification', {
          type: n.type,
          title: n.title,
          message: n.message,
          bookingId: n.bookingId,
          actionUrl: n.actionUrl,
        });
      });
    }

    console.log(`✅ Auto-completed ${ids.length} bookings, sent ${notifications.length} feedback requests`);
  } catch (err) {
    console.error('❌ Auto-complete cron error:', err.message);
  }
});

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://gleaming-trust-production-e46f.up.railway.app',  // ✅ Your frontend
      'https://pleasant-enthusiasm-production-0c41.up.railway.app',
      'http://localhost:3000',
      'http://localhost:3001',
      FRONTEND_URL,
      /\.railway\.app$/,
      /\.up\.railway\.app$/,
    ];
    const isAllowed = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
}));

// ── Middleware ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('📋 Authorization header:', req.headers.authorization || 'None');
  next();
});

// ── Health ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'OK',
  message: 'Backend running',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  port: PORT,
}));

app.get('/health', (req, res) =>
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
);

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', auth);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profile);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/drafts', draftsRouter);

// ── 404 ──────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({
  success: false,
  message: `Route ${req.originalUrl} not found`,
}));

// ── Error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Start ────────────────────────────────────────────────────────
httpServer.listen(PORT, '::', () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔌 Socket.io enabled`);
  console.log(`⏰ Cron jobs active`);
  console.log('=================================');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  httpServer.close(() => console.log('HTTP server closed'));
});

export default app;