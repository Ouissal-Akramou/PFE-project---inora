import express from 'express';
import { prisma} from '../lib/prisma.js';
import auth from '../Middlewares/auth.js';

const router = express.Router();


// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(notifications);
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// ⚠️ MUST be before /:id/read — otherwise "read-all" is treated as an :id
// PATCH /api/notifications/read-all
router.patch('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /notifications/read-all error:', err);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  const notifId = req.params.id; // ✅ string cuid, no parseInt

  try {
    const existing = await prisma.notification.findFirst({
      where: { id: notifId, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notif = await prisma.notification.update({
      where: { id: notifId },
      data:  { read: true },
    });

    res.json(notif);
  } catch (err) {
    console.error('PATCH /notifications/:id/read error:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});


export default router;
