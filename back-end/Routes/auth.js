import express from 'express';
import { protect, isAdmin } from '../Middlewares/auth.js';
import {
  register,
  login,
  logout,
  getMe,
  getProfile,
  forgotPassword,
  resetPassword,
  getAdminUsers,
  toggleSuspendUser,
} from '../Controllers/auth.js'; 

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.get('/profile/me', protect, getProfile);

// Admin routes
router.get('/admin/users', protect, isAdmin, getAdminUsers);
router.patch('/admin/users/:id/suspend', protect, isAdmin, toggleSuspendUser);

export default router;