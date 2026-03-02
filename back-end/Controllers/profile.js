import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:        true,
        fullName:  true,
        email:     true,
        avatarUrl: true,
        role:      true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// PATCH /api/profile/me/name
export const updateMyName = async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim() === '')
      return res.status(400).json({ message: 'Name cannot be empty' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  { fullName: fullName.trim() },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, createdAt: true }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PATCH /api/profile/me/email
export const updateMyEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    if (!email || !currentPassword)
      return res.status(400).json({ message: 'Email and current password are required' });

    // Get user with password
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect' });

    // Check email not already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.user.id)
      return res.status(400).json({ message: 'Email already in use' });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  { email },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, createdAt: true }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
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
      data:  { password: hashed },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  { avatarUrl },
      select: { avatarUrl: true },
    });

    res.json({ avatarUrl: updated.avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};