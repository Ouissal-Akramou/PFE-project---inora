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
  updateAvatar,
  upload,
  updateName,
  updateEmail,
  updatePassword,
  deleteAccount,
} from '../Controllers/auth.js';

import { validations, errorValidatorHandler } from '../Middlewares/Validations.js';
import { protect, isAdmin } from '../Middlewares/auth.js'; // ✅ named imports

const router = express.Router();

// ── Public ──
router.post('/login',           validations.login,          errorValidatorHandler, login);
router.post('/register',        validations.register,       errorValidatorHandler, register);
router.post('/reset-password',  validations.resetPassword,  errorValidatorHandler, resetPassword);
router.post('/forgot-password', validations.forgotPassword, errorValidatorHandler, forgotPassword);
router.post('/logout',          logout);
router.get( '/me',              protect, getMe); // ✅ protect — was unguarded

// Protected routes
router.get('/me', protect, getMe);
router.get('/profile/me', protect, getProfile);

// ── Admin ──
router.get(  '/admin/users',             isAdmin, getAdminUsers);      // ✅ isAdmin not just protect
router.patch('/admin/users/:id/suspend', isAdmin, toggleSuspendUser);  // ✅ isAdmin

export default router;