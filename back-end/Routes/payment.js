import express          from 'express';
import { protect }      from '../Middlewares/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
} from '../Controllers/payment.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm',       protect, confirmPayment);

export default router;
