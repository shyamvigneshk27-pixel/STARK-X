import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalTrips] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTrips = await prisma.trip.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  const tripsPerDayMap: Record<string, number> = {};
  recentTrips.forEach((t) => {
    const day = t.createdAt.toISOString().slice(0, 10);
    tripsPerDayMap[day] = (tripsPerDayMap[day] ?? 0) + 1;
  });
  const tripsPerDay = Object.entries(tripsPerDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const topCitiesRaw = await prisma.stop.groupBy({
    by: ['cityId'],
    _count: { cityId: true },
    orderBy: { _count: { cityId: 'desc' } },
    take: 10,
  });

  const cityIds = topCitiesRaw.map((r) => r.cityId);
  const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });
  const cityMap = new Map(cities.map((c) => [c.id, c.name]));

  const topCities = topCitiesRaw.map((r) => ({
    id: r.cityId,
    name: cityMap.get(r.cityId) ?? 'Unknown',
    count: r._count.cityId,
  }));

  res.json({ totalUsers, totalTrips, topCities, tripsPerDay });
});

// ── GET /api/admin/recent ─────────────────────────────────────────────────────
router.get('/recent', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const recentTrips = await prisma.trip.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  res.json(recentTrips.map((t) => ({
    id: t.id,
    tripName: t.name,
    userName: t.user.name,
    userEmail: t.user.email,
    createdAt: t.createdAt,
    stopsCount: 0,
  })));
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(users);
});

export default router;
