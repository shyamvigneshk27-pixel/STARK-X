import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/admin/stats
export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [users, trips, sharedTrips, invoices] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.sharedItinerary.count(),
      prisma.invoice.count(),
    ]);

    const tripsByType = await prisma.trip.groupBy({ by: ['type'], _count: true });
    const tripsByStatus = await prisma.trip.groupBy({ by: ['status'], _count: true });
    const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, role: true } });

    res.json({
      success: true,
      data: { users, trips, sharedTrips, invoices, tripsByType, tripsByStatus, recentUsers },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = {};
    if (search) where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: parseInt(limit as string), orderBy: { createdAt: 'desc' }, select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, _count: { select: { trips: true } } } }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: { users, total } });
  } catch (err) { next(err); }
};

// GET /api/admin/popular-cities
export const getPopularCities = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stops = await prisma.tripStop.groupBy({
      by: ['cityName', 'country'],
      _count: { cityName: true },
      orderBy: { _count: { cityName: 'desc' } },
      take: 10,
    });
    res.json({ success: true, data: stops });
  } catch (err) { next(err); }
};
