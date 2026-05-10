import { Router } from 'express';
import { getCommunityFeed } from '../controllers/shareController';

const router = Router();
router.get('/', getCommunityFeed);
export default router;
