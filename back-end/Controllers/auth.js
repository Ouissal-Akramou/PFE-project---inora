import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { transporter } from "../lib/mailer.js";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ══════════════════════════════════════════
//  MULTER — avatar upload config
// ══════════════════════════════════════════
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'));
};
export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });


// ══════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════
export const register = async (req, res) => {
  try {
    const { fullName, email, password, adminCode } = req.body;

    const role = adminCode && adminCode === process.env.ADMIN_SECRET_CODE
      ? 'admin'
      : 'user';

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, role }
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


// ══════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════
export const login = async (req, res) => {
  try {
    const { email, password, role, adminCode } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account no longer exists.' });
    }

    if (user.suspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `You are not registered as ${role}` });
    }

    if (role === 'admin') {
      if (!adminCode) return res.status(403).json({ message: 'Admin code is required' });
      if (adminCode !== process.env.ADMIN_SECRET_CODE)
        return res.status(403).json({ message: 'Invalid admin code' });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure:   false,
      sameSite: "lax",
      maxAge:   60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id:       user.id,
        fullName: user.fullName,
        email:    user.email,
        role:     user.role,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// ══════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// ══════════════════════════════════════════
//  GET ME
// ══════════════════════════════════════════
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: {
        id:        true,
        fullName:  true,
        email:     true,
        role:      true,
        avatarUrl: true,
        createdAt: true,
        isDeleted: true,
        suspended: true,
      }
    });

    if (!user || user.isDeleted) {
      res.clearCookie("token");
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      res.clearCookie("token");
      return res.status(403).json({ message: 'Your account has been suspended.' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};


// ══════════════════════════════════════════
//  FORGOT PASSWORD
// ══════════════════════════════════════════
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || user.isDeleted) {
      return res.status(200).json({ message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from:    `"Support" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below:</p>
        <a href="${resetLink}"
           style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    return res.status(200).json({ message: "If the email exists, a reset link has been sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// ══════════════════════════════════════════
//  RESET PASSWORD
// ══════════════════════════════════════════
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ message: 'Reset token is required' });

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    if (user.isDeleted) return res.status(403).json({ message: 'This account no longer exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashedPassword }
    });

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(400).json({ message: 'Reset token expired' });
    if (error.name === 'JsonWebTokenError')
      return res.status(400).json({ message: 'Invalid reset token' });
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


// ══════════════════════════════════════════
//  ADMIN — GET ALL USERS
// ══════════════════════════════════════════
export const getAdminUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const users = await prisma.user.findMany({
      select: {
        id:        true,
        fullName:  true,
        email:     true,
        role:      true,
        suspended: true,
        isDeleted: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            bookings:      true,
            reviews:       true,
            conversations: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// ══════════════════════════════════════════
//  ADMIN — SUSPEND / UNSUSPEND USER
// ══════════════════════════════════════════
export const toggleSuspendUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { suspended } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data:  { suspended }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// ══════════════════════════════════════════
//  PROFILE — UPDATE AVATAR
// ══════════════════════════════════════════
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // delete old avatar from disk
    const current = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { avatarUrl: true }
    });
    if (current?.avatarUrl) {
      const oldPath = `.${current.avatarUrl}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl } });

    res.json({ message: 'Avatar updated.', avatarUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};


// ══════════════════════════════════════════
//  PROFILE — UPDATE NAME
// ══════════════════════════════════════════
export const updateName = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ message: 'Name is required.' });
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  { fullName }
    });
    res.json({ message: 'Name updated.', fullName: updated.fullName });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};


// ══════════════════════════════════════════
//  PROFILE — UPDATE EMAIL
// ══════════════════════════════════════════
export const updateEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect password.' });

    const exists = await prisma.user.findFirst({
      where: { email, NOT: { id: req.user.id } }
    });
    if (exists) return res.status(400).json({ message: 'Email already in use.' });

    await prisma.user.update({ where: { id: req.user.id }, data: { email } });
    res.json({ message: 'Email updated.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};


// ══════════════════════════════════════════
//  PROFILE — UPDATE PASSWORD
// ══════════════════════════════════════════
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect current password.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};


// ══════════════════════════════════════════
//  PROFILE — DELETE ACCOUNT
// ══════════════════════════════════════════
export const deleteAccount = async (req, res) => {
  try {
    const { password, adminCode } = req.body;

    if (adminCode !== process.env.ADMIN_SECRET_CODE)
      return res.status(403).json({ message: 'Invalid admin code.' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect password.' });

    await prisma.user.update({ where: { id: req.user.id }, data: { isDeleted: true } });
    res.clearCookie('token');
    res.json({ message: 'Account deleted.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
