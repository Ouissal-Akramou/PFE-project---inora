import auth from '../Middlewares/auth.js';
import express from 'express';
import { getMyProfile , updateMyName, updateMyEmail, updateMyPassword, updateMyAvatar} from '../Controllers/profile.js';
import upload from '../Middlewares/upload.js';

const router = express.Router();



router.patch('/me/avatar', auth, upload.single('avatar'), updateMyAvatar);
router.get('/me', auth, getMyProfile);
router.patch('/me/name', auth, updateMyName);
router.patch('/me/email', auth, updateMyEmail);
router.patch('/me/password', auth, updateMyPassword);
export default router;

