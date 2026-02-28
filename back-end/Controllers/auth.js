import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { transporter } from "../lib/mailer.js";
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { fullName, email, password, adminCode } = req.body;

    // ✅ Determine role from admin code
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


export const login = async (req, res) => {
  try {                                          // ✅ missing this
    const { email, password, role, adminCode } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    // ✅ Role mismatch check
    if (role && user.role !== role) {
      return res.status(403).json({ message: `You are not registered as ${role}` });
    }

    // ✅ Admin code check
    if (role === 'admin') {
      if (!adminCode) {
        return res.status(403).json({ message: 'Admin code is required' });
      }
      if (adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ message: 'Invalid admin code' });
      }
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,        // ← true in production
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {                              // ✅ now matches correctly
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};




export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Reset token is required' });
        }
        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        // Find user from token payload
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        return res.status(200).json({
            message: 'Password reset successful'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

export const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await prisma.user.findFirst({
            where: { email }
        });

        // Always return same response (security)
        if (!user) {
            return res.status(200).json({
                message: "If the email exists, a reset link has been sent"
            });
        }

        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_RESET_SECRET,
            { expiresIn: "15m" }
        );

        const resetLink =
            `http://localhost:3000/reset-password?token=${resetToken}`;

        // Send email
        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
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

        return res.status(200).json({
            message: "If the email exists, a reset link has been sent"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const logout = async (req, res) => {
    try {

        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
  where: { id: decoded.id },
  select: { 
    id: true, 
    fullName: true, 
    email: true,
    role: true   // ✅ must be here
  }
});

    
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
