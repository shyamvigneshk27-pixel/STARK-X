import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { cacheFlushTrip } from '../lib/redis';

const router = Router();

// ── GET /api/share/:shareId ───────────────────────────────────────────────────
router.get('/:shareId', async (req: Request, res: Response) => {
  const { shareId } = req.params;

  const trip = await prisma.trip.findFirst({
    where: { shareId, isPublic: true },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      stops: {
        orderBy: { order: 'asc' },
        include: {
          city: true,
          activities: { orderBy: { startTime: 'asc' } },
        },
      },
    },
  });

  if (!trip) {
    res.status(404).json({ error: 'Trip not found or is private' });
    return;
  }

  res.json(trip);
});

// ── PATCH /api/share/:tripId/toggle ──────────────────────────────────────────
router.patch('/:tripId/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic: !trip.isPublic },
    select: { isPublic: true, shareId: true },
  });

  await cacheFlushTrip(tripId);
  res.json(updated);
});

// ── POST /api/share/:shareId/copy ─────────────────────────────────────────────
router.post('/:shareId/copy', requireAuth, async (req: AuthRequest, res: Response) => {
  const { shareId } = req.params;

  const original = await prisma.trip.findFirst({
    where: { shareId, isPublic: true },
    include: {
      stops: {
        include: {
          activities: true,
        },
      },
    },
  });

  if (!original) {
    res.status(404).json({ error: 'Trip not found or is private' });
    return;
  }

  // Deep clone the trip
  const newTrip = await prisma.trip.create({
    data: {
      userId: req.userId as string,
      name: `${original.name} (Copy)`,
      description: original.description,
      coverPhoto: original.coverPhoto,
      startDate: original.startDate,
      endDate: original.endDate,
      totalBudget: original.totalBudget,
      stops: {
        create: original.stops.map((stop) => ({
          cityId: stop.cityId,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          order: stop.order,
          activities: {
            create: stop.activities.map((act) => ({
              name: act.name,
              type: act.type,
              estimatedCost: act.estimatedCost,
              durationHrs: act.durationHrs,
              startTime: act.startTime,
              notes: act.notes,
            })),
          },
        })),
      },
    },
  });

  res.status(201).json({ newTripId: newTrip.id });
});

export default router;
