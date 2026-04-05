import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// ── protect: verifies token from cookie OR Authorization header ──
export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Essayer de récupérer le token du cookie d'abord
    let token = req.cookies?.token;
    
    // 2️⃣ Si pas de token dans les cookies, essayer le header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3️⃣ Si toujours pas de token → 401
    if (!token) {
      console.log('❌ No token provided in cookies or Authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    // 4️⃣ Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5️⃣ Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ── isAdmin: protect + role check in one step ──
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