import express from 'express';
import { protect, isAdmin } from '../Middlewares/auth.js';
import {
  getMyBookings,
  getPaidBookings,
  getAllBookings,
  getAllBookingsHistory,
  createBooking,
  getBookingById,
  submitDraft,
  updateBookingStatus,
  deleteBooking,
} from '../Controllers/booking.js';

const router = express.Router();

// ── Static/specific routes FIRST (before any /:id) ──

// Admin
router.get('/all',           isAdmin, getAllBookingsHistory);  // full history
router.get('/paid',          isAdmin, getPaidBookings);
router.get('/',              isAdmin, getAllBookings);         // overview
router.patch('/:id/status',  isAdmin, updateBookingStatus);
router.delete('/:id',        isAdmin, deleteBooking);

// User
router.get('/my',            protect, getMyBookings);
router.post('/',             protect, createBooking);
router.get('/:id',           protect, getBookingById);        // ← /:id always last
router.patch('/:id/submit',  protect, submitDraft);

export default router;
