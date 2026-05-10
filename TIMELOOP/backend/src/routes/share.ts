import { Router } from 'express';
import { getSharedItinerary, getCommunityFeed } from '../controllers/shareController';

const router = Router();
router.get('/:slug', getSharedItinerary);
export default router;
