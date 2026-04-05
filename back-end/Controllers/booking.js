import { prisma } from '../lib/prisma.js';
import jwt        from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// ── Mailer ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmedEmail = async (booking) => {
  const checkoutUrl = `${process.env.FRONTEND_URL}/checkout?bookingId=${booking.id}`;
  const paymentLink = `${process.env.FRONTEND_URL}/checkout?bookingId=${booking.id}`;

  await transporter.sendMail({
    from:    `"Inora" <${process.env.SMTP_USER}>`,
    to:      booking.email,
    subject: `✦ Your booking is confirmed — proceed to payment`,
    html: `
      <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#FBEAD6;padding:40px 32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <p style="font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#C87D87;margin:0 0 6px;">Inora</p>
          <h1 style="font-size:28px;font-style:italic;color:#3a3027;margin:0;">Booking Confirmed</h1>
          <div style="width:48px;height:1px;background:#C87D87;margin:12px auto 0;opacity:0.4;"></div>
        </div>
        <p style="font-size:15px;color:#5a4a3a;line-height:1.7;margin-bottom:8px;">
          Dear <strong>${booking.fullName}</strong>,
        </p>
        <p style="font-size:15px;color:#5a4a3a;line-height:1.7;margin-bottom:28px;">
          Great news — your booking request has been reviewed and
          <strong style="color:#6B7556;">confirmed</strong> by our team.
          Your spot is reserved. Proceed to payment below to secure your experience.
        </p>
        <div style="background:rgba(255,255,255,0.70);border:1px solid rgba(58,48,39,0.08);border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <div style="padding:12px 20px;background:rgba(255,255,255,0.50);border-bottom:1px solid rgba(58,48,39,0.06);">
            <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(90,74,58,0.70);margin:0;font-weight:600;">Your Booking</p>
          </div>
          ${[
            ['Reference', `#${String(booking.id).padStart(5, '0')}`],
            ['Activity',  booking.activity  || '—'],
            ['Date',      booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—'],
            ['Time',      booking.timeSlot  || '—'],
            ['Guests',    `${booking.participants ?? 1} ${(booking.participants ?? 1) === 1 ? 'person' : 'people'}`],
            ['Location',  booking.location  || '—'],
          ].map(([label, value]) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 20px;border-bottom:1px solid rgba(58,48,39,0.05);">
              <span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(90,74,58,0.55);font-weight:600;flex-shrink:0;margin-right:12px;">${label}</span>
              <span style="font-size:14px;font-style:italic;color:rgba(58,48,39,0.90);text-align:right;">${value}</span>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${paymentLink}"
            style="display:inline-block;font-family:'Georgia',serif;font-style:italic;font-size:13px;
                   letter-spacing:0.22em;text-transform:uppercase;color:#FBEAD6;
                   background:linear-gradient(135deg,#6B7556 0%,#4a5240 50%,#6B7556 100%);
                   padding:14px 36px;border-radius:12px;text-decoration:none;
                   box-shadow:0 5px 20px rgba(107,117,86,0.30);">
            ✦ Proceed to Payment ✦
          </a>
        </div>
        <p style="font-size:12px;color:rgba(90,74,58,0.45);line-height:1.6;margin-bottom:28px;text-align:center;">
          If the button doesn't work, copy this link into your browser:<br/>
          <a href="${paymentLink}" style="color:#C87D87;word-break:break-all;font-style:italic;">${checkoutUrl}</a>
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

// ── Helpers ──────────────────────────────────────────
// MODIFIÉ : supporte cookie ET header Authorization
export const getLoggedInUser = async (req) => {
  try {
    // Essayer cookie d'abord
    let token = req.cookies?.token;
    
    // Si pas de token dans cookie, essayer header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
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
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    console.error('GET /bookings/my error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/bookings/paid ────────────────────────────
export const getPaidBookings = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized - Admin only' });
    }

    const paid = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PAID',
        user: { isDeleted: false },
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

// ── GET /api/bookings — clean list for overview widget ──
export const getAllBookings = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized - Admin only' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        isDraft: false,
        status:  { not: 'cancelled' },
        user:    { isDeleted: false },
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
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/bookings ────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    let userId = null;
    try {
      // Essayer cookie d'abord
      let token = req.cookies?.token;
      
      // Si pas de token dans cookie, essayer header Authorization
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }
      
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
        activity:         bookingData.activity         || 'Not specified',
        participants:     parseInt(bookingData.participants) || 1,
        date:             bookingData.date ? new Date(bookingData.date) : null,
        timeSlot:         bookingData.timeSlot         || null,
        setting:          bookingData.setting          || null,
        location:         bookingData.location         || null,
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

    res.status(201).json({ message: 'Booking saved successfully', booking });
  } catch (err) {
    console.error('POST /bookings error:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// ── GET /api/bookings/:id ─────────────────────────────
export const getBookingById = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.id },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json(booking);
  } catch (err) {
    console.error('GET /bookings/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/bookings/:id/submit ────────────────────
export const submitDraft = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  try {
    const user = await getLoggedInUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const booking = await prisma.booking.update({
      where: { id: bookingId, userId: user.id },
      data:  { isDraft: false, status: 'pending' },
    });

    res.json(booking);
  } catch (err) {
    console.error('PATCH /bookings/:id/submit error:', err);
    res.status(500).json({ message: 'Submission failed' });
  }
};

// ── PATCH /api/bookings/:id/status ───────────────────
export const updateBookingStatus = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  if (isNaN(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });

  const { status } = req.body;
  const io = req.app.get('io');

  try {
    // Vérifier que l'utilisateur est admin
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized - Admin only' });
    }

    const booking = await prisma.booking.update({
      where:   { id: bookingId },
      data:    { status },
      include: { user: true },
    });

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

    // ── confirmed → notification + email ──
    if (status === 'confirmed') {
      const targetUserId = await resolveUserId();
      if (targetUserId) {
        const notif = await prisma.notification.create({
          data: {
            userId:    targetUserId,
            type:      'BOOKING_CONFIRMED',
            title:     'Booking Confirmed 🎉',
            message:   `Your booking for "${booking.activity || 'your activity'}" on ${
              booking.date
                ? new Date(booking.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })
                : 'your chosen date'
            } has been confirmed. Please proceed with the advance payment to secure your spot.`,
            actionUrl: `/bookings`,
            bookingId: booking.id,
            read:      false,
          },
        });

        io?.to(`user_${targetUserId}`).emit('notification', {
          id:        notif.id,
          type:      notif.type,
          title:     notif.title,
          message:   notif.message,
          bookingId: notif.bookingId,
          actionUrl: notif.actionUrl,
          createdAt: notif.createdAt,
        });

        console.log(`✅ Notification BOOKING_CONFIRMED emitted → userId: ${targetUserId}`);
      } else {
        console.warn(`⚠️ No user found for booking ${bookingId} — no notification sent`);
      }

      // ── send confirmation email ──
      sendBookingConfirmedEmail(booking).catch(err =>
        console.error('Booking confirmed email error:', err.message)
      );
    }

    // ── completed → review request notification ──
    if (status === 'completed') {
      const targetUserId = await resolveUserId();
      if (targetUserId) {
        const notif = await prisma.notification.create({
          data: {
            userId:    targetUserId,
            type:      'REVIEW_REQUEST',
            title:     '✨ How was your experience?',
            message:   `Your "${booking.activity || 'gathering'}" is complete! Share your thoughts and help our community grow.`,
            actionUrl: `/reviews/new?bookingId=${booking.id}`,
            bookingId: booking.id,
            read:      false,
          },
        });

        io?.to(`user_${targetUserId}`).emit('notification', {
          id:        notif.id,
          type:      notif.type,
          title:     notif.title,
          message:   notif.message,
          bookingId: notif.bookingId,
          actionUrl: notif.actionUrl,
          createdAt: notif.createdAt,
        });

        console.log(`✅ Notification REVIEW_REQUEST emitted → userId: ${targetUserId}`);
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
    // Vérifier que l'utilisateur est admin
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized - Admin only' });
    }

    await prisma.booking.delete({ where: { id: bookingId } });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('DELETE /bookings/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET /api/bookings/all — full history for admin ────
// ── GET /api/bookings/all — full history for admin ────
export const getAllBookingsHistory = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized - Admin only' });
    }

    const bookings = await prisma.booking.findMany({
    
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
    res.status(500).json({ message: 'Server error' });
  }
};