import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTrips, getTripById, createTrip, updateTrip, deleteTrip,
  addStop, removeStop, addSection, updateSection, deleteSection, addActivity, shareTrip,
} from '../controllers/tripController';

const router = Router();

router.use(authenticate);
router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/stops', addStop);
router.delete('/:id/stops/:stopId', removeStop);
router.post('/:id/sections', addSection);
router.patch('/:id/sections/:sectionId', updateSection);
router.delete('/:id/sections/:sectionId', deleteSection);
router.post('/:id/activities', addActivity);
router.post('/:id/share', shareTrip);

export default router;
