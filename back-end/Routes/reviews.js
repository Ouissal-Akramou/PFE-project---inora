import express from 'express';
import { createReview, getApprovedReviews, getPendingReviews, approveReview, deleteReview } from '../Controllers/reviews.js';
import auth from '../Middlewares/auth.js';

const router = express.Router();

router.get('/approved', getApprovedReviews);       // Public - homepage
                             // Protect all below
router.post('/',auth, createReview);                    // User submits
router.get('/pending',auth, getPendingReviews);         // Admin - pending
router.patch('/:id/approve',auth, approveReview);       // Admin - approve
router.delete('/:id',auth, deleteReview);               // Admin - delete

export default router;
