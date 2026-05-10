import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getBudget, updateBudget, addExpense, deleteExpense, getBudgetAnalytics } from '../controllers/budgetController';

const router = Router();
router.use(authenticate);
router.get('/:tripId', getBudget);
router.put('/:tripId', updateBudget);
router.post('/:tripId/expenses', addExpense);
router.delete('/:tripId/expenses/:expenseId', deleteExpense);
router.get('/:tripId/analytics', getBudgetAnalytics);
export default router;
