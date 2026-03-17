import express from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ── Middleware helpers ──────────────────────────────────────────────

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Non autorisé' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const getLoggedInUser = async (req) => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await prisma.user.findUnique({ where: { id: decoded.id } });
  } catch {
    return null;
  }
};

// ── Routes (order matters!) ─────────────────────────────────────────

// ✅ 1. GET /api/bookings/my
router.get('/my', async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings/my error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ 2. GET /api/bookings/paid — admin only  ← MUST be before /:id
router.get('/paid', isAdmin, async (req, res) => {
  try {
    const paid = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { paidAt: 'desc' },
    });
    res.json(paid);
  } catch (err) {
    console.error('GET /bookings/paid error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. GET /api/bookings — admin only, all bookings
router.get('/', isAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, email: true } } },
    });
    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ 4. POST /api/bookings — create booking (guest or logged-in)
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
      return res.status(400).json({ message: 'Données incomplètes' });
    }

    let userId = null;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) {}

    const booking = await prisma.booking.create({
      data: {
        fullName:         bookingData.fullName,
        email:            bookingData.email,
        phone:            bookingData.phone,
        activity:         bookingData.activity || bookingData.activityType || 'Non spécifié',
        participants:     parseInt(bookingData.participants) || 1,
        date:             bookingData.date ? new Date(bookingData.date) : null,
        timeSlot:         bookingData.timeSlot || null,
        allergies:        bookingData.allergies || null,
        specialRequests:  bookingData.specialRequests || null,
        additionalNotes:  bookingData.additionalNotes || null,
        preferredContact: bookingData.preferredContact || 'telephone',
        activityTheme:    bookingData.activityTheme || null,
        userId:           userId,
      },
    });

    res.status(201).json({ message: 'Réservation enregistrée avec succès', booking });
  } catch (err) {
    console.error('POST /bookings error:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

// ✅ 5. GET /api/bookings/:id — single booking for checkout page
router.get('/:id', async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    res.json(booking);
  } catch (err) {
    console.error('GET /bookings/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ 6. PATCH /api/bookings/:id/status — admin updates status
router.patch('/:id/status', isAdmin, async (req, res) => {
  const { status } = req.body;
  const bookingId = parseInt(req.params.id);

  if (isNaN(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { user: true },
    });

    if (status === 'confirmed') {
      let targetUserId = booking.userId;

      if (!targetUserId && booking.email) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: booking.email },
        });
        targetUserId = userByEmail?.id ?? null;

        if (targetUserId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { userId: targetUserId },
          });
        }
      }

      if (targetUserId) {
        await prisma.notification.create({
          data: {
            userId:    targetUserId,
            type:      'BOOKING_CONFIRMED',
            title:     'Réservation confirmée 🎉',
            message:   `Votre réservation pour "${booking.activity || 'votre activité'}" le ${
              booking.date
                ? new Date(booking.date).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })
                : 'la date choisie'
            } a été confirmée. Veuillez procéder au paiement de l'avance pour finaliser votre place.`,
            bookingId: booking.id,
            read:      false,
          },
        });
        console.log(`✅ Notification created for userId: ${targetUserId}`);
      } else {
        console.warn(`⚠️ No user found for booking ${bookingId} — no notification sent`);
      }
    }
    if (status === 'completed') {
  let targetUserId = booking.userId; // ← booking is already updated here, this is fine

  if (!targetUserId && booking.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: booking.email },
    });
    targetUserId = userByEmail?.id ?? null;

    // ✅ also link user to booking if found (same as confirmed block)
    if (targetUserId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data:  { userId: targetUserId },
      });
    }
  }

  if (targetUserId) {
    await prisma.notification.create({
      data: {
        userId:    targetUserId,
        type:      'REVIEW_REQUEST',
        title:     "✨ How was your experience?",
        message:   `Your "${booking.activity || 'gathering'}" is complete! Share your thoughts and help our community grow.`,
        bookingId: booking.id,
        read:      false,
      },
    });
    console.log(`✅ Review-request notification sent to userId: ${targetUserId}`);
  } else {
    console.warn(`⚠️ No user found for booking ${bookingId} — review notification not sent`);
  }
}


    res.json(booking);
  } catch (err) {
    console.error('PATCH /bookings/:id/status error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});
// ✅ DELETE /api/bookings/:id — admin deletes a booking
router.delete('/:id', isAdmin, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid ID' });
  try {
    await prisma.booking.delete({ where: { id: bookingId } });
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    console.error('DELETE /bookings/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
