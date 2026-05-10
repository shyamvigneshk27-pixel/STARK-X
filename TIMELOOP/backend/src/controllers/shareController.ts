import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

// GET /api/share/:slug
export const getSharedItinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shared = await prisma.sharedItinerary.findFirst({
      where: { shareSlug: req.params.slug, isActive: true },
      include: {
        trip: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            stops: {
              orderBy: { order: 'asc' },
              include: {
                sections: {
                  orderBy: { order: 'asc' },
                  include: { activities: { orderBy: { order: 'asc' } } },
                },
              },
            },
            budget: true,
          },
        },
      },
    });

    if (!shared || !shared.trip.isPublic) return next(createError('Itinerary not found or not public.', 404));

    // Increment view count
    await prisma.sharedItinerary.update({ where: { id: shared.id }, data: { viewCount: { increment: 1 } } });

    res.json({ success: true, data: shared });
  } catch (err) { next(err); }
};

// GET /api/community?page=1&limit=12&search=paris&type=BEACH
export const getCommunityFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '12', search, type } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isPublic: true, status: { not: 'DRAFT' } };
    if (search) where.title = { contains: search as string, mode: 'insensitive' };
    if (type) where.type = type;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          stops: { orderBy: { order: 'asc' }, take: 3 },
          _count: { select: { stops: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({
      success: true,
      data: { trips, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch (err) { next(err); }
};
