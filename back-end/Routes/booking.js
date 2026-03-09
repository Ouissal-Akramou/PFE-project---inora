import express from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken'; // ← أضيفي هاد السطر

const router = express.Router();

// Middleware للتحقق من أن المستخدم أدمن
const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Non autorisé' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// GET /api/bookings - Récupérer toutes les réservations (admin seulement)
router.get('/', isAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/bookings - Créer une nouvelle réservation
router.post('/', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validation basique
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
      return res.status(400).json({ message: 'Données incomplètes' });
    }

    const booking = await prisma.booking.create({
      data: {
        fullName: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        activity: bookingData.activity || bookingData.activityType || 'Non spécifié',
        participants: parseInt(bookingData.participants) || 1,
        date: bookingData.date ? new Date(bookingData.date) : null,
        timeSlot: bookingData.timeSlot || null,
        allergies: bookingData.allergies || null,
        specialRequests: bookingData.specialRequests || null,
        additionalNotes: bookingData.additionalNotes || null,
        preferredContact: bookingData.preferredContact || 'telephone',
        activityTheme: bookingData.activityTheme || null,
        createdAt: new Date()
      }
    });

    res.status(201).json({ 
      message: 'Réservation enregistrée avec succès',
      booking 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

export default router;