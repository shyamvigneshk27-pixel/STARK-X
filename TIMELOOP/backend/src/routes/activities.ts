import { Router } from 'express';
import { searchActivities, getActivitySuggestions } from '../controllers/activityController';

const router = Router();
router.get('/search', searchActivities);
router.get('/suggestions', getActivitySuggestions);
export default router;
