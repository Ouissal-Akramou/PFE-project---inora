import express      from 'express';
import { protect }  from '../Middlewares/auth.js'; // ✅ fixed
import upload       from '../Middlewares/upload.js';
import {
  getMyProfile,
  updateMyName,
  updateMyEmail,
  updateMyPassword,
  updateMyAvatar,
  verifyMyPassword,
  deleteMyAccount,
  cancelMyBooking,
} from '../Controllers/profile.js';

const router = express.Router();

router.get(    '/me',                     protect,                          getMyProfile);
router.patch(  '/me/avatar',              protect, upload.single('avatar'), updateMyAvatar);
router.patch(  '/me/name',                protect,                          updateMyName);
router.patch(  '/me/email',               protect,                          updateMyEmail);
router.patch(  '/me/password',            protect,                          updateMyPassword);
router.post(   '/me/verify-password',     protect,                          verifyMyPassword);
router.delete( '/me',                     protect,                          deleteMyAccount);
router.patch(  '/me/bookings/:id/cancel', protect,                          cancelMyBooking);

export default router;
