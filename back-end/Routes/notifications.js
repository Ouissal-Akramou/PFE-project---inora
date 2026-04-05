import express from 'express';
import { protect } from '../Middlewares/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../Controllers/notifications.js';

const router = express.Router();

// ✅ ALL routes need authentication
router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;