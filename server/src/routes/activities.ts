import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate, createActivitySchema } from '../lib/validate';
import { cacheFlushTrip } from '../lib/redis';

const router = Router();
router.use(requireAuth);

// ── POST /api/activities ──────────────────────────────────────────────────────
router.post('/', validate(createActivitySchema), async (req: AuthRequest, res: Response) => {
  const { stopId, name, type, estimatedCost, durationHrs, startTime, notes } = req.body;

  const stop = await prisma.stop.findFirst({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Stop not found' });
    return;
  }

  const activity = await prisma.activity.create({
    data: { stopId, name, type, estimatedCost, durationHrs, startTime: startTime || null, notes: notes || null },
  });

  await cacheFlushTrip(stop.tripId);
  res.status(201).json(activity);
});

// ── PATCH /api/activities/:id ──────────────────────────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const activity = await prisma.activity.findFirst({
    where: { id },
    include: { stop: { include: { trip: true } } },
  });

  if (!activity || activity.stop.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  const { name, type, estimatedCost, durationHrs, startTime, notes, isBooked } = req.body;

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(estimatedCost !== undefined && { estimatedCost }),
      ...(durationHrs !== undefined && { durationHrs }),
      ...(startTime !== undefined && { startTime: startTime || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(isBooked !== undefined && { isBooked }),
    },
  });

  await cacheFlushTrip(activity.stop.tripId);
  res.json(updated);
});

// ── DELETE /api/activities/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const activity = await prisma.activity.findFirst({
    where: { id },
    include: { stop: { include: { trip: true } } },
  });

  if (!activity || activity.stop.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }

  await prisma.activity.delete({ where: { id } });
  await cacheFlushTrip(activity.stop.tripId);
  res.json({ message: 'Activity deleted' });
});

export default router;
