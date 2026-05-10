import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate, createStopSchema } from '../lib/validate';
import { cacheFlushTrip } from '../lib/redis';

const router = Router();
router.use(requireAuth);

// ── POST /api/stops ───────────────────────────────────────────────────────────
router.post('/', validate(createStopSchema), async (req: AuthRequest, res: Response) => {
  const { tripId, cityId, arrivalDate, departureDate, order } = req.body;

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId,
      arrivalDate: new Date(arrivalDate),
      departureDate: new Date(departureDate),
      order,
    },
    include: { city: true, activities: true },
  });

  await cacheFlushTrip(tripId);
  res.status(201).json(stop);
});

// ── PATCH /api/stops/:id ──────────────────────────────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const stop = await prisma.stop.findFirst({
    where: { id },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Stop not found' });
    return;
  }

  const { arrivalDate, departureDate, order } = req.body;

  const updated = await prisma.stop.update({
    where: { id },
    data: {
      ...(arrivalDate && { arrivalDate: new Date(arrivalDate) }),
      ...(departureDate && { departureDate: new Date(departureDate) }),
      ...(order !== undefined && { order }),
    },
    include: { city: true, activities: true },
  });

  await cacheFlushTrip(stop.tripId);
  res.json(updated);
});

// ── DELETE /api/stops/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const stop = await prisma.stop.findFirst({
    where: { id },
    include: { trip: true },
  });

  if (!stop || stop.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Stop not found' });
    return;
  }

  await prisma.stop.delete({ where: { id } });
  await cacheFlushTrip(stop.tripId);
  res.json({ message: 'Stop deleted' });
});

export default router;
