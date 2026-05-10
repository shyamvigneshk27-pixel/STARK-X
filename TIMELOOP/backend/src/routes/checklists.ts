import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getChecklist, addItem, updateItem, deleteItem, resetChecklist, syncOfflineItems } from '../controllers/checklistController';

const router = Router();
router.use(authenticate);
router.get('/:tripId', getChecklist);
router.post('/:tripId/items', addItem);
router.patch('/:tripId/items/:itemId', updateItem);
router.delete('/:tripId/items/:itemId', deleteItem);
router.post('/:tripId/reset', resetChecklist);
router.post('/:tripId/sync', syncOfflineItems);
export default router;
