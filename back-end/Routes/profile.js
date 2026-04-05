// Controllers/profile.js
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const getMyProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        isDeleted: true,
        suspended: true,
      }
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Account suspended.' });
    }

    res.json({ user });
    
  } catch (error) {
    console.error('❌ [getMyProfile] Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateMyName = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName?.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName }
    });
    
    res.json({ message: 'Name updated.', fullName: updated.fullName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const updateMyEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    const exists = await prisma.user.findFirst({
      where: { email, NOT: { id: req.user.id } }
    });
    
    if (exists) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { email } });
    res.json({ message: 'Email updated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: { avatarUrl } 
    });

    res.json({ message: 'Avatar updated.', avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const verifyMyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.json({ message: 'Password verified.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    const { password, adminCode } = req.body;

    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Invalid admin code.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: { isDeleted: true } 
    });
    
    res.clearCookie('token');
    res.json({ message: 'Account deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const cancelMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await prisma.booking.findFirst({
      where: {
        id: id,
        userId: req.user.id,
        status: { in: ['confirmed', 'pending'] }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const updated = await prisma.booking.update({
      where: { id: id },
      data: { status: 'cancelled' }
    });
    
    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};