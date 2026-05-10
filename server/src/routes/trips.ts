import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate, createTripSchema } from '../lib/validate';
import { cacheGet, cacheSet, cacheDelete, cacheFlushTrip } from '../lib/redis';
import { logger } from '../lib/logger';

const router = Router();
router.use(requireAuth);

// ── GET /api/trips ────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const cacheKey = `trips:user:${req.userId}`;
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const trips = await prisma.trip.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      stops: {
        include: { city: true },
        orderBy: { order: 'asc' },
      },
      _count: { select: { stops: true } },
    },
  });

  await cacheSet(cacheKey, trips, 30);
  res.json(trips);
});

// ── GET /api/trips/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const cacheKey = `trip:${id}`;

  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const trip = await prisma.trip.findFirst({
    where: { id, userId: req.userId },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          city: true,
          activities: { orderBy: { startTime: 'asc' } },
        },
      },
      notes: { orderBy: { createdAt: 'desc' } },
      checklist: true,
    },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  await cacheSet(cacheKey, trip, 60);
  res.json(trip);
});

// ── POST /api/trips ───────────────────────────────────────────────────────────
router.post('/', validate(createTripSchema), async (req: AuthRequest, res: Response) => {
  const { name, startDate, endDate, totalBudget, description, coverPhoto } = req.body;

  const trip = await prisma.trip.create({
    data: {
      userId: req.userId as string,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalBudget: totalBudget ?? 0,
      description: description || null,
      coverPhoto: coverPhoto || null,
    },
  });

  await cacheDelete(`trips:user:${req.userId}`);
  logger.info('Trip created', { userId: req.userId, tripId: trip.id, name });
  res.status(201).json(trip);
});

// ── PATCH /api/trips/:id ──────────────────────────────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.trip.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const { name, startDate, endDate, totalBudget, description, coverPhoto } = req.body;

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(totalBudget !== undefined && { totalBudget }),
      ...(description !== undefined && { description }),
      ...(coverPhoto !== undefined && { coverPhoto }),
    },
  });

  await cacheFlushTrip(id);
  await cacheDelete(`trips:user:${req.userId}`);
  res.json(trip);
});

// ── DELETE /api/trips/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.trip.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  await prisma.trip.delete({ where: { id } });
  await cacheFlushTrip(id);
  await cacheDelete(`trips:user:${req.userId}`);

  logger.info('Trip deleted', { userId: req.userId, tripId: id });
  res.json({ message: 'Trip deleted' });
});

export default router;
