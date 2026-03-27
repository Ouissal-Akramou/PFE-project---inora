import express      from 'express';
import { protect }  from '../Middlewares/auth.js';
import {
  getDraft,
  saveDraft,
  deleteDraft,
} from '../Controllers/drafts.js';

const router = express.Router();

router.get(    '/',    protect, getDraft);
router.post(   '/',    protect, saveDraft);
router.delete( '/:id', protect, deleteDraft);

export default router;
