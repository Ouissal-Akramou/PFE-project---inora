import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { transporter } from "../lib/mailer.js";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
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

// ══════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════
export const login = async (req, res) => {
  try {
    const { email, password, role, adminCode } = req.body;

    console.log('🔐 Login attempt:', { email, role, adminCode: adminCode ? 'present' : 'missing' });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid email' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account no longer exists.' });
    }

    if (user.suspended) {
      console.log('❌ Account suspended:', email);
      return res.status(403).json({ message: 'Account suspended' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `You are not registered as ${role}` });
    }

    if (role === 'admin') {
      if (!adminCode) {
        return res.status(403).json({ message: 'Admin code is required' });
      }
      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // ← Changé 1h → 7d

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000  // ← Changé 1h → 7 jours
    });

    console.log('✅ Login successful for:', email);
    
    // 🔥 AJOUTE LE TOKEN DANS LA RÉPONSE JSON
    return res.status(200).json({
      message: "Login successful",
      token: accessToken,  // ← AJOUTE CETTE LIGNE
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ message: "Internal server error" });
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
  } catch (error) {
    console.error('getLoggedInUser error:', error.message);
    return null;
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
};// force redeploy Sat Mar 28 22:33:21 +01 2026
