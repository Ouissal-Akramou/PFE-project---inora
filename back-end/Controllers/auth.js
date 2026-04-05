import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { transporter } from "../lib/mailer.js";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cookie options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

// ──────────────────────────────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────────────────────────────
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
      data: { 
        id: uuidv4(),
        fullName, 
        email, 
        password: hashed, 
        role 
      }
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

// ──────────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, role, adminCode } = req.body;

    console.log('🔐 [login] Login attempt:', { email, role });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account no longer exists.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Account suspended' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `You are not registered as ${role}` });
    }

    if (role === 'admin') {
      if (!adminCode || adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie("token", accessToken, getCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('❌ [login] Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ──────────────────────────────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ──────────────────────────────────────────────────────────────────
// GET ME
// ──────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ──────────────────────────────────────────────────────────────────
// GET PROFILE (for /api/profile/me)
// ──────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ──────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ──────────────────────────────────────────────────────────────────
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

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset",
      html: `<h2>Password Reset</h2><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });

    return res.status(200).json({ message: "If the email exists, a reset link has been sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ──────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ──────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ message: 'Reset token is required' });

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(400).json({ message: 'Reset token expired' });
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

// ──────────────────────────────────────────────────────────────────
// ADMIN - GET ALL USERS
// ──────────────────────────────────────────────────────────────────
export const getAdminUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        isDeleted: true,
        suspended: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ──────────────────────────────────────────────────────────────────
// ADMIN - TOGGLE SUSPEND USER
// ──────────────────────────────────────────────────────────────────
export const toggleSuspendUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { suspended } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};