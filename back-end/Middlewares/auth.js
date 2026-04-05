import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;
    
    console.log('🔐 [protect] Checking for token...');
    
    // Read token from Authorization header (from localStorage)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('✅ [protect] Token found in Authorization header');
      }
    }
    
    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ [protect] Token found in cookie');
    }

    if (!token) {
      console.log('❌ [protect] No token found');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔐 [protect] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [protect] Token verified for user:', decoded.id);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isDeleted: true,
        suspended: true,
      }
    });

    if (!user || user.isDeleted) {
      console.log('❌ [protect] User not found or deleted');
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      console.log('❌ [protect] Account suspended');
      return res.status(403).json({ message: 'Account suspended.' });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ [protect] Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// ✅ ADD THIS - isAdmin middleware
export const isAdmin = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Default export for compatibility
export default protect;