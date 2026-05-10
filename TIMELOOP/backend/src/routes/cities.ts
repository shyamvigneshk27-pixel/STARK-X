import { Router } from 'express';
import { searchCities, getPopularCities, getCityRegions } from '../controllers/cityController';

const router = Router();
router.get('/search', searchCities);
router.get('/popular', getPopularCities);
router.get('/regions', getCityRegions);
export default router;
