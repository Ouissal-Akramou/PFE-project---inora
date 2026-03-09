import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// إنشاء جلسة دفع
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { bookingId, amount, description, customerEmail, customerName } = req.body;

    // إنشاء جلسة دفع مع Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
              description: `Réservation Inora - ${description}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe يتعامل بالسنتيمات
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?booking_id=${bookingId}`,
      customer_email: customerEmail,
      metadata: {
        bookingId,
        customerName,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Webhook لتأكيد الدفع (يستدعيه Stripe بعد الدفع الناجح)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // التعامل مع حدث الدفع الناجح
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { bookingId } = session.metadata;

    // تحديث حالة الحجز في قاعدة البيانات
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent,
      },
    });

    // إنشاء فاتورة في قاعدة البيانات
    await prisma.invoice.create({
      data: {
        bookingId,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: 'paid',
        stripeSessionId: session.id,
        customerEmail: session.customer_details.email,
        customerName: session.customer_details.name,
        paidAt: new Date(),
      },
    });
  }

  res.json({ received: true });
});

// التحقق من حالة الدفع
router.get('/check-status/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { invoice: true },
    });

    res.json({
      status: booking?.status || 'pending',
      paid: booking?.status === 'paid',
      invoice: booking?.invoice,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

export default router;