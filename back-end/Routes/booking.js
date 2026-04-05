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

// Admin
router.get('/all',  protect, isAdmin, getAllBookingsHistory);
router.get('/paid', protect, isAdmin, getPaidBookings);
router.get('/',     protect, isAdmin, getAllBookings);

router.patch('/:id/status', protect, isAdmin, updateBookingStatus);
router.delete('/:id',       protect, isAdmin, deleteBooking);

// User
router.get('/my', protect, getMyBookings);
router.post('/',  protect, createBooking);

router.get('/:id',          protect, getBookingById);
router.patch('/:id/submit', protect, submitDraft);

export default router;