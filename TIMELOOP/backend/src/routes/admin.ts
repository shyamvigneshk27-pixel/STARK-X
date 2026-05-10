import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getStats, getUsers, getPopularCities } from '../controllers/adminController';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/popular-cities', getPopularCities);
export default router;
