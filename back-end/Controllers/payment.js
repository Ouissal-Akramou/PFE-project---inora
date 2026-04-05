import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADVANCE_AMOUNT = 250;
const PRICE_PER_PERSON = 150;

// ── Mailer ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPaymentConfirmationEmail = async (booking, payMode, amountPaid) => {
  const total     = (booking.participants ?? 1) * PRICE_PER_PERSON;
  const remaining = payMode === 'full' ? 0 : total - amountPaid;

  const rows = [
    ['Reference',    `#${String(booking.id).padStart(5, '0')}`],
    ['Activity',     booking.activity  || '—'],
    ['Date',         booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—'],
    ['Time',         booking.timeSlot  || '—'],
    ['Guests',       `${booking.participants ?? 1} ${(booking.participants ?? 1) === 1 ? 'person' : 'people'}`],
    ['Location',     booking.location  || '—'],
    ['Advance Paid', `${amountPaid} MAD`],
    ['Due on Day',   remaining > 0 ? `${remaining} MAD` : 'Nothing — fully paid ✦'],
  ].map(([label, value]) => `
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 20px;border-bottom:1px solid rgba(58,48,39,0.05);">
      <span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(90,74,58,0.55);font-weight:600;flex-shrink:0;margin-right:12px;">${label}</span>
      <span style="font-size:14px;font-style:italic;color:rgba(58,48,39,0.90);text-align:right;">${value}</span>
    </div>
  `).join('');

  await transporter.sendMail({
    from:    `"Inora" <${process.env.EMAIL_USER}>`,
    to:      booking.email,
    subject: `✦ Payment Confirmed — Booking #${String(booking.id).padStart(5, '0')}`,
    html: `
      <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#FBEAD6;padding:40px 32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <p style="font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#C87D87;margin:0 0 6px;">Inora</p>
          <h1 style="font-size:28px;font-style:italic;color:#3a3027;margin:0;">Payment Confirmed</h1>
          <div style="width:48px;height:1px;background:#C87D87;margin:12px auto 0;opacity:0.4;"></div>
        </div>
        <p style="font-size:15px;color:#5a4a3a;line-height:1.7;margin-bottom:24px;">
          Dear <strong>${booking.fullName}</strong>,<br/>
          Thank you for choosing Inora. Your payment has been received and your spot is confirmed.
        </p>
        <div style="background:rgba(255,255,255,0.70);border:1px solid rgba(58,48,39,0.08);border-radius:12px;overflow:hidden;margin-bottom:24px;">
          <div style="padding:12px 20px;background:rgba(255,255,255,0.50);border-bottom:1px solid rgba(58,48,39,0.06);">
            <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(90,74,58,0.70);margin:0;font-weight:600;">Booking Details</p>
          </div>
          ${rows}
        </div>
        <p style="font-size:14px;font-style:italic;color:#7a6a5a;line-height:1.7;text-align:center;margin-bottom:32px;">
          We can't wait to welcome you.<br/>If you have any questions, simply reply to this email.
        </p>
        <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(200,125,135,0.20);">
          <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(90,74,58,0.35);margin:0;">
            Inora · Your gathering, beautifully arranged.
          </p>
        </div>
      </div>
    `,
  });
};

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

// ── POST /api/payments/create-intent ─────────────────────────────
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

// ── POST /api/payments/confirm ────────────────────────────────────
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
    const amountPaid = payMode === 'full' ? totalAmount : ADVANCE_AMOUNT;

    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PAID',
        paymentMode: payMode ?? 'advance',
        advancePaid: amountPaid,
        paidAt: new Date(),
      },
    });

    // ── Send confirmation email (fire-and-forget) ──
    sendPaymentConfirmationEmail(updated, payMode, amountPaid).catch(err =>
      console.error('Payment email error:', err.message)
    );

    res.json({ success: true, booking: updated });

  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};