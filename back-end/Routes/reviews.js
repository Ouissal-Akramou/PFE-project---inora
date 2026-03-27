import express      from 'express';
import { protect, isAdmin } from '../Middlewares/auth.js'; // ✅
import {
  getApprovedReviews,
  getPendingReviews,
  createReview,
  approveReview,
  deleteReview,
} from '../Controllers/reviews.js';

const router = express.Router();

// ── Public ──
router.get('/approved',       getApprovedReviews);

// ── Static routes before /:id ──
router.get('/pending',        isAdmin,  getPendingReviews);  // ✅ isAdmin not just protect
router.patch('/:id/approve',  isAdmin,  approveReview);      // ✅ isAdmin
router.delete('/:id',         isAdmin,  deleteReview);       // ✅ isAdmin

// ── User ──
router.post('/',              protect,  createReview);

export default router;
