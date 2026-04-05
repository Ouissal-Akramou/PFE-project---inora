import express      from 'express';
import { protect }  from '../Middlewares/auth.js';
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from '../Controllers/notifications.js';

const router = express.Router();

router.get(   '/',            protect, getNotifications);
router.patch( '/read-all',    protect, markAllRead);      // ✅ static before /:id
router.patch( '/:id/read',    protect, markOneRead);

export default router;