import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';

const router = Router();
router.use(authenticate);
router.get('/:tripId', getNotes);
router.post('/:tripId', createNote);
router.patch('/:tripId/:noteId', updateNote);
router.delete('/:tripId/:noteId', deleteNote);
export default router;
