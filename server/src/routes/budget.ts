import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { cacheGet, cacheSet } from '../lib/redis';

const router = Router();
router.use(requireAuth);

interface CategoryBucket {
  name: string;
  value: number;
}

interface StopBucket {
  city: string;
  total: number;
  nights: number;
  perDay: number;
  overspent: boolean;
}

interface BudgetData {
  grandTotal: number;
  budget: number;
  remaining: number;
  overBudget: boolean;
  byCategory: CategoryBucket[];
  byStop: StopBucket[];
  avgPerDay: number;
  currency: string;
  displayTotal: number;
  displayBudget: number;
  displayRemaining: number;
}

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  INR: 83.2,
  AUD: 1.53,
  CAD: 1.36,
};

// ── GET /api/budget/:tripId ───────────────────────────────────────────────────
router.get('/:tripId', async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  const currency = ((req.query.currency as string) || 'USD').toUpperCase();
  const cacheKey = `budget:${tripId}`;

  const cached = await cacheGet<BudgetData>(cacheKey);
  if (cached) {
    const rate = CURRENCY_RATES[currency] ?? 1;
    res.json({
      ...cached,
      currency,
      displayTotal: Number((cached.grandTotal * rate).toFixed(2)),
      displayBudget: Number((cached.budget * rate).toFixed(2)),
      displayRemaining: Number((cached.remaining * rate).toFixed(2)),
    });
    return;
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: req.userId },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          city: true,
          activities: true,
        },
      },
    },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const totalNights = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 3600 * 24)
    )
  );

  const dailyBudget = trip.totalBudget / totalNights;
  const byCategory: Record<string, number> = {};
  let grandTotal = 0;

  const byStop: StopBucket[] = trip.stops.map((stop) => {
    let stopTotal = 0;
    stop.activities.forEach((act) => {
      stopTotal += act.estimatedCost;
      grandTotal += act.estimatedCost;
      byCategory[act.type] = (byCategory[act.type] ?? 0) + act.estimatedCost;
    });

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) /
          (1000 * 3600 * 24)
      )
    );

    const perDay = nights > 0 ? stopTotal / nights : stopTotal;

    return {
      city: stop.city.name,
      total: Number(stopTotal.toFixed(2)),
      nights,
      perDay: Number(perDay.toFixed(2)),
      overspent: perDay > dailyBudget && trip.totalBudget > 0,
    };
  });

  const remaining = trip.totalBudget - grandTotal;
  const avgPerDay = totalNights > 0 ? grandTotal / totalNights : 0;

  const result: BudgetData = {
    grandTotal: Number(grandTotal.toFixed(2)),
    budget: trip.totalBudget,
    remaining: Number(remaining.toFixed(2)),
    overBudget: remaining < 0,
    byCategory: Object.entries(byCategory).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    })),
    byStop,
    avgPerDay: Number(avgPerDay.toFixed(2)),
    currency: 'USD',
    displayTotal: Number(grandTotal.toFixed(2)),
    displayBudget: trip.totalBudget,
    displayRemaining: Number(remaining.toFixed(2)),
  };

  await cacheSet(cacheKey, result, 120);

  const rate = CURRENCY_RATES[currency] ?? 1;
  res.json({
    ...result,
    currency,
    displayTotal: Number((result.grandTotal * rate).toFixed(2)),
    displayBudget: Number((result.budget * rate).toFixed(2)),
    displayRemaining: Number((result.remaining * rate).toFixed(2)),
  });
});

export default router;
