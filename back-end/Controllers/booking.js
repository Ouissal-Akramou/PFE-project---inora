import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

// ── Helpers ──────────────────────────────────────────
export const getLoggedInUser = async (req) => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await prisma.user.findUnique({ where: { id: decoded.id } });
  } catch {
    return null;
  }
};

// ── GET /api/bookings/my ──────────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    const bookings = await prisma.booking.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings/my error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── GET /api/bookings/paid ────────────────────────────
export const getPaidBookings = async (req, res) => {
  try {
    const paid = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PAID',
        user: { isDeleted: false },   // ✅ exclude deleted users
      },
      include: {
        user: {
          select: {
            fullName:  true,
            email:     true,
            avatarUrl: true,
            isDeleted: true,
          }
        }
      },
      orderBy: { paidAt: 'desc' },
    });

    res.json(paid);
  } catch (err) {
    console.error('GET /bookings/paid error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/bookings — clean list for overview widget
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        isDraft: false,
        status:  { not: 'cancelled' },   // ✅ no cancelled
        user:    { isDeleted: false },   // ✅ no deleted users
      },
      include: {
        user: {
          select: {
            id:        true,
            fullName:  true,
            email:     true,
            avatarUrl: true,
            isDeleted: true,
            suspended: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── POST /api/bookings ────────────────────────────────
export const createBooking = async (req, res) => {
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
        activity:         bookingData.activity         || 'Non spécifié',
        participants:     parseInt(bookingData.participants) || 1,
        date:             bookingData.date ? new Date(bookingData.date) : null,
        timeSlot:         bookingData.timeSlot         || null,
        setting:          bookingData.setting          || null,
        allergies:        bookingData.allergies        || null,
        specialRequests:  bookingData.specialRequests  || null,
        additionalNotes:  bookingData.additionalNotes  || null,
        preferredContact: bookingData.preferredContact || 'telephone',
        activityTheme:    bookingData.activityTheme    || null,
        isDraft:          bookingData.isDraft ?? false,
        status:           'pending',
        userId,
      },
    });

    res.status(201).json({ message: 'Réservation enregistrée avec succès', booking });
  } catch (err) {
    console.error('POST /bookings error:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
  }
};

// ── GET /api/bookings/:id ─────────────────────────────
export const getBookingById = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.id },
    });

    if (!booking) return res.status(404).json({ message: 'Réservation introuvable' });

    res.json(booking);
  } catch (err) {
    console.error('GET /bookings/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ── PATCH /api/bookings/:id/submit ────────────────────
export const submitDraft = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Non autorisé' });

    const booking = await prisma.booking.update({
      where: { id: bookingId, userId: user.id },
      data:  { isDraft: false, status: 'pending' },
    });

    res.json(booking);
  } catch (err) {
    console.error('PATCH /bookings/:id/submit error:', err);
    res.status(500).json({ message: 'Erreur lors de la soumission' });
  }
};

// ── PATCH /api/bookings/:id/status ───────────────────
export const updateBookingStatus = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where:   { id: bookingId },
      data:    { status },
      include: { user: true },
    });

    // ── helper: resolve userId from booking or email ──
    const resolveUserId = async () => {
      if (booking.userId) return booking.userId;
      if (!booking.email) return null;

      const found = await prisma.user.findUnique({ where: { email: booking.email } });
      if (found) {
        await prisma.booking.update({ where: { id: bookingId }, data: { userId: found.id } });
        return found.id;
      }
      return null;
    };

    // ── confirmed → payment notification ──
    if (status === 'confirmed') {
      const targetUserId = await resolveUserId();
      if (targetUserId) {
        await prisma.notification.create({
          data: {
            userId:    targetUserId,
            type:      'BOOKING_CONFIRMED',
            title:     'Réservation confirmée 🎉',
            message:   `Votre réservation pour "${booking.activity || 'votre activité'}" le ${
              booking.date
                ? new Date(booking.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
                : 'la date choisie'
            } a été confirmée. Veuillez procéder au paiement de l'avance pour finaliser votre place.`,
            bookingId: booking.id,
            read:      false,
          },
        });
        console.log(`✅ Notification BOOKING_CONFIRMED → userId: ${targetUserId}`);
      } else {
        console.warn(`⚠️ No user found for booking ${bookingId} — no notification sent`);
      }
    }

    // ── completed → review request notification ──
    if (status === 'completed') {
      const targetUserId = await resolveUserId();
      if (targetUserId) {
        await prisma.notification.create({
          data: {
            userId:    targetUserId,
            type:      'REVIEW_REQUEST',
            title:     '✨ How was your experience?',
            message:   `Your "${booking.activity || 'gathering'}" is complete! Share your thoughts and help our community grow.`,
            bookingId: booking.id,
            read:      false,
          },
        });
        console.log(`✅ Notification REVIEW_REQUEST → userId: ${targetUserId}`);
      } else {
        console.warn(`⚠️ No user found for booking ${bookingId} — review notification not sent`);
      }
    }

    res.json(booking);
  } catch (err) {
    console.error('PATCH /bookings/:id/status error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// ── DELETE /api/bookings/:id ──────────────────────────
export const deleteBooking = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    await prisma.booking.delete({ where: { id: bookingId } });
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    console.error('DELETE /bookings/:id error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// ── GET /api/bookings/all — full history for admin reservations tab
export const getAllBookingsHistory = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { isDraft: false },   // ✅ only exclude drafts, nothing else
      include: {
        user: {
          select: {
            id:        true,
            fullName:  true,
            email:     true,
            avatarUrl: true,
            isDeleted: true,
            suspended: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings/all error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
