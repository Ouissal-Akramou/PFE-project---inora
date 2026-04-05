import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';  // ← ZID HADI

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADVANCE_AMOUNT = 250;
const PRICE_PER_PERSON = 150;

// Middleware to get user
const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── POST /api/payments/create-intent ────────────────────────────
export const createPaymentIntent = async (req, res) => {
  const { bookingId, payMode } = req.body;

  if (!bookingId)
    return res.status(400).json({ error: 'bookingId required' });

  try {
    // Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking)
      return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    if (booking.paymentStatus === 'PAID')
      return res.status(400).json({ error: 'Already paid' });

    const participants = parseInt(booking.participants) || 1;
    const totalAmount = participants * PRICE_PER_PERSON;
    const amountToPay = payMode === 'full' ? totalAmount : ADVANCE_AMOUNT;

    console.log('💰 Creating payment intent:', {
      bookingId,
      amount: amountToPay,
      payMode,
      userId: req.user.id
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToPay * 100,
      currency: 'usd',
      metadata: {
        bookingId: String(bookingId),
        userId: String(req.user.id),
        payMode: payMode ?? 'advance',
      },
      description: `Réservation Inora — ${booking.activity} (${payMode === 'full' ? 'full' : 'advance'})`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('createPaymentIntent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/payments/confirm ───────────────────────────────────
export const confirmPayment = async (req, res) => {
  const { paymentIntentId, bookingId, payMode } = req.body;

  if (!paymentIntentId || !bookingId)
    return res.status(400).json({ error: 'paymentIntentId and bookingId required' });

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ error: 'Payment has not succeeded' });

    if (paymentIntent.metadata.bookingId !== String(bookingId))
      return res.status(403).json({ error: 'Booking mismatch' });

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking || booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const participants = parseInt(booking?.participants) || 1;
    const totalAmount = participants * PRICE_PER_PERSON;

    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PAID',
        paymentMode: payMode ?? 'advance',
        advancePaid: payMode === 'full' ? totalAmount : ADVANCE_AMOUNT,
        paidAt: new Date(),
      },
    });

    res.json({ success: true, booking: updated });

  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};