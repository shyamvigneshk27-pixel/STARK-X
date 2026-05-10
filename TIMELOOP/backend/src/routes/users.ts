import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMe, updateMe, updateAvatar } from '../controllers/userController';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/avatar', updateAvatar);

export default router;
