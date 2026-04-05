import express from 'express';
import {
  login,
  register,
  resetPassword,
  forgotPassword,
  logout,
  getMe,
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
import { protect, isAdmin } from '../Middlewares/auth.js'; // ← Named import for isAdmin

const router = express.Router();

// ── Public ──
router.post('/login',           validations.login,          errorValidatorHandler, login);
router.post('/register',        validations.register,       errorValidatorHandler, register);
router.post('/reset-password',  validations.resetPassword,  errorValidatorHandler, resetPassword);
router.post('/forgot-password', validations.forgotPassword, errorValidatorHandler, forgotPassword);
router.post('/logout',          logout);
router.get( '/me',              protect, getMe);

// ── Profile (authenticated) ──
router.post(  '/avatar',          protect, upload.single('avatar'), updateAvatar);
router.patch( '/update-name',     protect, updateName);
router.patch( '/update-email',    protect, updateEmail);
router.patch( '/update-password', protect, updatePassword);
router.delete('/delete-account',  protect, deleteAccount);

// ── Admin ──
router.get(  '/admin/users',             isAdmin, getAdminUsers);      // ✅ Now works
router.patch('/admin/users/:id/suspend', isAdmin, toggleSuspendUser);  // ✅ Now works

export default router;