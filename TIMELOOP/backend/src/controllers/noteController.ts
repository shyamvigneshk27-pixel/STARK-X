import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// GET /api/notes/:tripId
export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notes = await prisma.tripNote.findMany({
      where: { tripId: req.params.tripId, userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notes });
  } catch (err) { next(err); }
};

// POST /api/notes/:tripId
export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await prisma.tripNote.create({
      data: { tripId: req.params.tripId, userId: req.user!.id, ...req.body },
    });
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
};

// PATCH /api/notes/:tripId/:noteId
export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await prisma.tripNote.findFirst({ where: { id: req.params.noteId, userId: req.user!.id } });
    if (!note) return next(createError('Note not found.', 404));
    const updated = await prisma.tripNote.update({ where: { id: req.params.noteId }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/notes/:tripId/:noteId
export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.tripNote.delete({ where: { id: req.params.noteId } });
    res.json({ success: true, message: 'Note deleted.' });
  } catch (err) { next(err); }
};
