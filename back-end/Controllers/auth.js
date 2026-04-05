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
  from:    `"Inora" <${process.env.EMAIL_USER}>`,
  to:      user.email,
  subject: '✦ Reset your Inora password',
  html: `
    <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#FBEAD6;padding:40px 32px;border-radius:16px;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#C87D87;margin:0 0 6px;">Inora</p>
        <h1 style="font-size:28px;font-style:italic;color:#3a3027;margin:0;">Password Reset</h1>
        <div style="width:48px;height:1px;background:#C87D87;margin:12px auto 0;opacity:0.4;"></div>
      </div>

      <!-- Body -->
      <p style="font-size:15px;color:#5a4a3a;line-height:1.7;margin-bottom:8px;">
        Dear <strong>${user.fullName || 'there'}</strong>,
      </p>
      <p style="font-size:15px;color:#5a4a3a;line-height:1.7;margin-bottom:28px;">
        We received a request to reset the password for your Inora account.
        Click the button below to choose a new one — this link expires in
        <strong>15 minutes</strong>.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${resetLink}"
          style="display:inline-block;font-family:'Georgia',serif;font-style:italic;font-size:13px;
                 letter-spacing:0.22em;text-transform:uppercase;color:#FBEAD6;
                 background:linear-gradient(135deg,#C87D87 0%,#b36d77 50%,#C87D87 100%);
                 padding:14px 36px;border-radius:12px;text-decoration:none;
                 box-shadow:0 5px 20px rgba(200,125,135,0.30);">
          ✦ Reset my password ✦
        </a>
      </div>

      <!-- Security note -->
      <div style="background:rgba(107,117,86,0.07);border:1px solid rgba(107,117,86,0.16);
                  border-radius:10px;padding:12px 16px;margin-bottom:28px;">
        <p style="font-size:12px;color:rgba(107,117,86,0.80);margin:0;line-height:1.6;">
          🔒 If you didn't request this, you can safely ignore this email —
          your password will not be changed.
        </p>
      </div>

      <!-- Fallback link -->
      <p style="font-size:12px;color:rgba(90,74,58,0.45);line-height:1.6;margin-bottom:28px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}"
          style="color:#C87D87;word-break:break-all;font-style:italic;">${resetLink}</a>
      </p>

      <!-- Footer -->
      <div style="text-align:center;padding-top:24px;border-top:1px solid rgba(200,125,135,0.20);">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;
                  color:rgba(90,74,58,0.35);margin:0;">
          Inora · Your gathering, beautifully arranged.
        </p>
      </div>

    </div>
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