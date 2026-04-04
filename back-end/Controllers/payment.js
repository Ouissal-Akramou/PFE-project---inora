import Stripe        from 'stripe';
import { prisma }    from '../lib/prisma.js';

const stripe          = new Stripe(process.env.STRIPE_SECRET_KEY);
const ADVANCE_AMOUNT  = 250;
const PRICE_PER_PERSON = 150; // must match your frontend constant

// ── POST /api/payments/create-intent ────────────────────────────
export const createPaymentIntent = async (req, res) => {
  const { bookingId, payMode } = req.body; // ← also receive payMode here

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

    const participants  = parseInt(booking.participants) || 1;
    const totalAmount   = participants * PRICE_PER_PERSON;
    const amountToPay   = payMode === 'full' ? totalAmount : ADVANCE_AMOUNT;

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountToPay * 100, // ← charge the right amount
      currency: 'usd',
      metadata: {
        bookingId: String(bookingId),
        userId:    String(req.user.id),
        payMode:   payMode ?? 'advance', // ← store it in metadata too
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
  const { paymentIntentId, bookingId, payMode } = req.body; // ← destructure payMode

  if (!paymentIntentId || !bookingId)
    return res.status(400).json({ error: 'paymentIntentId and bookingId required' });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded')
      return res.status(400).json({ error: 'Payment has not succeeded' });

    if (paymentIntent.metadata.bookingId !== String(bookingId))
      return res.status(403).json({ error: 'Booking mismatch' });

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    const participants = parseInt(booking?.participants) || 1;
    const totalAmount  = participants * PRICE_PER_PERSON; // ← now defined

    const updated = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'PAID',
        paymentMode:   payMode ?? 'advance', // ← now defined
        advancePaid:   payMode === 'full' ? totalAmount : ADVANCE_AMOUNT,
        paidAt:        new Date(),
      },
    });

    res.json({ success: true, booking: updated });

  } catch (err) {
    console.error('confirmPayment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};