import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// ── GET /api/profile/me ──────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, 
        fullName: true, 
        email: true,
        //phone: true,
        avatarUrl: true, 
        role: true, 
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // ✅ Return wrapped in { user } for frontend compatibility
    res.json({ user });
  } catch (err) {
    console.error('getMyProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/profile/me/avatar ─────────────────────────────────
export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const existing = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (existing?.avatarUrl?.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), existing.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { avatarUrl: true },
    });

    res.json({ avatarUrl: updated.avatarUrl });
  } catch (err) {
    console.error('updateMyAvatar error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/profile/me/name ───────────────────────────────────
export const updateMyName = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName?.trim())
      return res.status(400).json({ message: 'Name cannot be empty' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName: fullName.trim() },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, createdAt: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('updateMyName error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/profile/me/email ──────────────────────────────────
export const updateMyEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;
    if (!email || !currentPassword)
      return res.status(400).json({ message: 'Email and current password are required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.user.id)
      return res.status(400).json({ message: 'Email already in use' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, createdAt: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('updateMyEmail error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/profile/me/password ──────────────────────────────
export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'All fields are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('updateMyPassword error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── POST /api/profile/me/verify-password ────────────────────────
export const verifyMyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Incorrect password' });

    res.json({ ok: true });
  } catch (err) {
    console.error('verifyMyPassword error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/profile/me ───────────────────────────────────────
export const deleteMyAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: 'Password is required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Incorrect password' });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    res.clearCookie('token');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('deleteMyAccount error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/profile/me/bookings/:id/cancel ───────────────────
export const cancelMyBooking = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const cancellable =
      booking.status === 'pending' ||
      (booking.status === 'confirmed' && booking.paymentStatus !== 'PAID');

    if (!cancellable)
      return res.status(400).json({ message: 'This booking cannot be cancelled.' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });
    res.json(updated);
  } catch (err) {
    console.error('cancelMyBooking error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};