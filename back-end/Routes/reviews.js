import express      from 'express';
import { protect, isAdmin } from '../Middlewares/auth.js';
import {
  getApprovedReviews,
  getPendingReviews,
  createReview,
  approveReview,
  deleteReview,
} from '../Controllers/reviews.js';

const router = express.Router();

// ── Public ──
router.get('/approved', getApprovedReviews);

// ── Admin routes (protect + isAdmin) ──
router.get('/pending', protect, isAdmin, getPendingReviews);      // ← زيد protect
router.patch('/:id/approve', protect, isAdmin, approveReview);    // ← زيد protect
router.delete('/:id', protect, isAdmin, deleteReview);            // ← زيد protect

// ── User ──
router.post('/', protect, createReview);

export default router;