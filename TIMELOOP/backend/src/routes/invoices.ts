import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getInvoices, generateInvoice } from '../controllers/invoiceController';

const router = Router();
router.use(authenticate);
router.get('/:tripId', getInvoices);
router.post('/:tripId/generate', generateInvoice);
export default router;
