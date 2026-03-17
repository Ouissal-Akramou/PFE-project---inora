import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import auth from '../Middlewares/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADVANCE_AMOUNT = 250;

// ── Create PaymentIntent ──────────────────────────────────
router.post('/create-intent', auth, async (req, res) => {
  const { bookingId } = req.body;
  console.log('🔍 bookingId received:', bookingId, typeof bookingId); // ← add this
  console.log('🔍 user:', req.user?.id);
  if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) }, // ✅ Int
    });
console.log('🔍 booking found:', booking); // ← add this line
console.log('🔍 booking.userId:', booking?.userId, '| req.user.id:', req.user?.id);
    if (!booking)                         return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id)   return res.status(403).json({ error: 'Forbidden' });
    if (booking.paymentStatus === 'PAID') return res.status(400).json({ error: 'Already paid' });
console.log('🔍 STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: ADVANCE_AMOUNT * 100,
      currency: 'usd',
      metadata: {
        bookingId: String(bookingId), // ✅ Stripe metadata must be a string
        userId: req.user.id,
      },
      description: `Avance réservation — ${booking.activity}`,
    });
console.log('🔍 paymentIntent created:', paymentIntent.id); // ← add this

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('create-intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Confirm after Stripe succeeds ────────────────────────
router.post('/confirm', auth, async (req, res) => {
  const { paymentIntentId, bookingId } = req.body;
  if (!paymentIntentId || !bookingId)
    return res.status(400).json({ error: 'paymentIntentId and bookingId required' });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ error: 'Payment has not succeeded' });

    // ✅ Both are strings here — metadata stores strings, bookingId from body is string
    if (paymentIntent.metadata.bookingId !== String(bookingId))
      return res.status(403).json({ error: 'Booking mismatch' });

    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId) }, // ✅ Int
      data: {
        paymentStatus: 'PAID',
        advancePaid:   ADVANCE_AMOUNT,
        paidAt:        new Date(),
      },
    });

    res.json({ success: true, booking: updated });

  } catch (err) {
    console.error('confirm error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
