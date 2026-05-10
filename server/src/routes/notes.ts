import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { cacheFlushTrip } from '../lib/redis';

const router = Router();
router.use(requireAuth);

// ── GET /api/notes (for a trip) ───────────────────────────────────────────────
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

  const notes = await prisma.note.findMany({
    where: { tripId: tripId as string },
    orderBy: { createdAt: 'desc' },
  });

  res.json(notes);
});

// ── POST /api/notes ───────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  const { tripId, content, stopId } = req.body;

  if (!tripId || !content) {
    res.status(400).json({ error: 'tripId and content required' });
    return;
  }

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return;
  }

  const note = await prisma.note.create({
    data: { tripId, content, userId: req.userId as string, stopId: stopId || null },
  });

  await cacheFlushTrip(tripId);
  res.status(201).json(note);
});

// ── PATCH /api/notes/:id ──────────────────────────────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  const note = await prisma.note.findFirst({ where: { id, userId: req.userId } });
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  const updated = await prisma.note.update({ where: { id }, data: { content } });
  await cacheFlushTrip(note.tripId);
  res.json(updated);
});

// ── DELETE /api/notes/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const note = await prisma.note.findFirst({ where: { id, userId: req.userId } });
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  await prisma.note.delete({ where: { id } });
  await cacheFlushTrip(note.tripId);
  res.json({ message: 'Note deleted' });
});

export default router;
