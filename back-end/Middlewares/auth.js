import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const protect = async (req, res, next) => {
  try {
    // Essayer cookie d'abord
    let token = req.cookies.token;
    
    // Si pas de token dans cookie, essayer header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = [
  protect,
  (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    next();
  }
];

export default protect;