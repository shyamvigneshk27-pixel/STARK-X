import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// Budget estimation based on preference and traveler count
const DAILY_RATES: Record<string, Record<string, number>> = {
  BUDGET:    { accommodation: 30,  food: 15,  transport: 10, activities: 10, misc: 5 },
  MODERATE:  { accommodation: 80,  food: 40,  transport: 25, activities: 30, misc: 15 },
  COMFORT:   { accommodation: 150, food: 80,  transport: 50, activities: 60, misc: 30 },
  LUXURY:    { accommodation: 350, food: 150, transport: 100, activities: 120, misc: 80 },
};

function estimateBudget(preference: string, days: number, travelers: number, currency: string = 'USD') {
  const rates = DAILY_RATES[preference] || DAILY_RATES.MODERATE;
  // Simple conversion for now, ideally fetch from a service/cache
  const rateMap: Record<string, number> = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79 };
  const factor = rateMap[currency] || 1;

  const results: any = {};
  Object.entries(rates).forEach(([key, value]) => {
    results[key] = value * days * (key === 'accommodation' ? 1 : travelers) * factor;
  });
  results.totalBudget = Object.values(results).reduce((s: any, r: any) => s + r, 0);
  return results;
}

// GET /api/budgets/:tripId
export const getBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user!.id },
      include: { budget: true, expenses: true },
    });
    if (!trip) return next(createError('Trip not found.', 404));

    const days = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const auto = estimateBudget(trip.budgetPreference, days, trip.travelersCount, trip.currency);
    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = trip.expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        budget: trip.budget || auto,
        estimated: auto,
        totalSpent,
        remaining: (trip.budget?.totalBudget || auto.totalBudget) - totalSpent,
        isOverBudget: totalSpent > (trip.budget?.totalBudget || auto.totalBudget),
        byCategory,
        expenses: trip.expenses,
        days,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/budgets/:tripId
export const updateBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    const budget = await prisma.budget.upsert({
      where: { tripId: req.params.tripId },
      create: { tripId: req.params.tripId, ...req.body },
      update: req.body,
    });
    res.json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

// POST /api/budgets/:tripId/expenses
export const addExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.tripId, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    const expense = await prisma.expense.create({
      data: {
        tripId: req.params.tripId,
        ...req.body,
        amount: parseFloat(req.body.amount),
        date: req.body.date ? new Date(req.body.date) : new Date(),
      },
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/budgets/:tripId/expenses/:expenseId
export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.expense.delete({ where: { id: req.params.expenseId } });
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/budgets/:tripId/analytics
export const getBudgetAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user!.id },
      include: { expenses: { orderBy: { date: 'asc' } }, budget: true },
    });
    if (!trip) return next(createError('Trip not found.', 404));

    const days = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = new Date(trip.startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = trip.expenses.filter(e => e.date.toISOString().split('T')[0] === dateStr);
      return { date: dateStr, amount: dayExpenses.reduce((s, e) => s + e.amount, 0), count: dayExpenses.length };
    });

    const categoryData = Object.entries(
      trip.expenses.reduce((acc: Record<string, number>, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    res.json({ success: true, data: { dailyData, categoryData, days } });
  } catch (err) {
    next(err);
  }
};
