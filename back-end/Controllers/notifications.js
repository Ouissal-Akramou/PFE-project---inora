import { prisma } from '../lib/prisma.js';

// ── GET /api/notifications ───────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });
    res.json(notifications);
  } catch (err) {
    console.error('getNotifications error:', err.message);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// ── PATCH /api/notifications/read-all ───────────────────────────
export const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data:  { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('markAllRead error:', err.message);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

// ── PATCH /api/notifications/:id/read ───────────────────────────
export const markOneRead = async (req, res) => {
  const notifId = req.params.id;
  try {
    const existing = await prisma.notification.findFirst({
      where: { id: notifId, userId: req.user.id },
    });

    if (!existing)
      return res.status(404).json({ message: 'Notification not found' });

    const notif = await prisma.notification.update({
      where: { id: notifId },
      data:  { read: true },
    });

    res.json(notif);
  } catch (err) {
    console.error('markOneRead error:', err.message);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};
