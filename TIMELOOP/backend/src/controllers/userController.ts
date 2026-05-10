import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// GET /api/users/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, city: true, country: true, bio: true,
        avatarUrl: true, role: true, isVerified: true, createdAt: true,
        _count: { select: { trips: true } },
      },
    });
    if (!user) return next(createError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me
export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, phone, city, country, bio } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone, city, country, bio },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, city: true, country: true, bio: true,
        avatarUrl: true, role: true, createdAt: true,
      },
    });
    res.json({ success: true, message: 'Profile updated.', data: user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me/avatar
export const updateAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return next(createError('Avatar URL required.', 400));

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    res.json({ success: true, message: 'Avatar updated.', data: user });
  } catch (err) {
    next(err);
  }
};
