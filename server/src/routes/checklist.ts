import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { cacheFlushTrip } from '../lib/redis';

const router = Router();
router.use(requireAuth);

// ── GET /api/checklist ────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const { tripId } = req.query;
  if (!tripId) {
    res.status(400).json({ error: 'tripId required' });
    return;
  }

  const trip = await prisma.trip.findFirst({ where: { id: tripId as string, userId: req.userId } });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const items = await prisma.checklistItem.findMany({
    where: { tripId: tripId as string },
    orderBy: { category: 'asc' },
  });

  res.json(items);
});

// ── POST /api/checklist ───────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  const { tripId, label, category } = req.body;

  if (!tripId || !label) {
    res.status(400).json({ error: 'tripId and label required' });
    return;
  }

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const item = await prisma.checklistItem.create({
    data: { tripId, label, category: category || 'general' },
  });

  res.status(201).json(item);
});

// ── PATCH /api/checklist/:id ──────────────────────────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isPacked, label } = req.body;

  const item = await prisma.checklistItem.findFirst({
    where: { id },
    include: { trip: true },
  });

  if (!item || item.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(isPacked !== undefined && { isPacked }),
      ...(label && { label }),
    },
  });

  res.json(updated);
});

// ── DELETE /api/checklist/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = await prisma.checklistItem.findFirst({
    where: { id },
    include: { trip: true },
  });

  if (!item || item.trip.userId !== req.userId) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  await prisma.checklistItem.delete({ where: { id } });
  res.json({ message: 'Item deleted' });
});

export default router;
