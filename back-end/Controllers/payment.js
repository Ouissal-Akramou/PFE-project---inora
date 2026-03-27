import Stripe        from 'stripe';
import { prisma }    from '../lib/prisma.js';

const stripe          = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADVANCE_AMOUNT  = 250;

// ── POST /api/payments/create-intent ────────────────────────────
export const createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId)
    return res.status(400).json({ error: 'bookingId required' });

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking)
      return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    if (booking.paymentStatus === 'PAID')
      return res.status(400).json({ error: 'Already paid' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:      ADVANCE_AMOUNT * 100,
      currency:    'usd',
      metadata: {
        bookingId: String(bookingId),
        userId:    req.user.id,
      },
      description: `Avance réservation — ${booking.activity}`,
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('createPaymentIntent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/payments/confirm ───────────────────────────────────
export const confirmPayment = async (req, res) => {
  const { paymentIntentId, bookingId } = req.body;

  if (!paymentIntentId || !bookingId)
    return res.status(400).json({ error: 'paymentIntentId and bookingId required' });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ error: 'Payment has not succeeded' });

    if (paymentIntent.metadata.bookingId !== String(bookingId))
      return res.status(403).json({ error: 'Booking mismatch' });

    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PAID',
        advancePaid:   ADVANCE_AMOUNT,
        paidAt:        new Date(),
      },
    });

    res.json({ success: true, booking: updated });

  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
