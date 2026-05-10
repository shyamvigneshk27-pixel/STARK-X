import { Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const tripInclude = {
  stops: { orderBy: { order: 'asc' as const }, include: { sections: { orderBy: { order: 'asc' as const }, include: { activities: { orderBy: { order: 'asc' as const } } } } } },
  budget: true,
  _count: { select: { expenses: true, notes: true } },
};

// GET /api/trips
export const getTrips = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: { stops: { orderBy: { order: 'asc' } }, budget: true, _count: { select: { expenses: true } } },
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
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:id
export const getTripById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: tripInclude,
    });
    if (!trip) return next(createError('Trip not found.', 404));
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips
export const createTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title, description, type, travelersCount, budgetPreference,
      startDate, endDate, totalBudgetGoal, currency, stops,
    } = req.body;

    const trip = await prisma.trip.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        type,
        travelersCount: parseInt(travelersCount),
        budgetPreference,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudgetGoal: totalBudgetGoal ? parseFloat(totalBudgetGoal) : null,
        currency: currency || 'USD',
        stops: stops?.length
          ? {
              create: stops.map((stop: any, idx: number) => ({
                cityName: stop.cityName,
                cityCode: stop.cityCode,
                country: stop.country,
                countryCode: stop.countryCode,
                lat: stop.lat,
                lng: stop.lng,
                order: idx,
                arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate) : null,
                departureDate: stop.departureDate ? new Date(stop.departureDate) : null,
              })),
            }
          : undefined,
      },
      include: tripInclude,
    });

    // Auto-create budget record
    await prisma.budget.create({ data: { tripId: trip.id } });
    // Auto-create checklist
    await prisma.packingChecklist.create({ data: { tripId: trip.id, userId: req.user!.id } });

    res.status(201).json({ success: true, message: 'Trip created.', data: trip });
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id
export const updateTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) return next(createError('Trip not found.', 404));

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
      include: tripInclude,
    });
    res.json({ success: true, message: 'Trip updated.', data: trip });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id
export const deleteTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) return next(createError('Trip not found.', 404));

    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Trip deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/stops
export const addStop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    const stopsCount = await prisma.tripStop.count({ where: { tripId: req.params.id } });
    const stop = await prisma.tripStop.create({
      data: {
        tripId: req.params.id,
        ...req.body,
        order: stopsCount,
        arrivalDate: req.body.arrivalDate ? new Date(req.body.arrivalDate) : null,
        departureDate: req.body.departureDate ? new Date(req.body.departureDate) : null,
      },
    });
    res.status(201).json({ success: true, data: stop });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id/stops/:stopId
export const removeStop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    await prisma.tripStop.delete({ where: { id: req.params.stopId } });
    res.json({ success: true, message: 'Stop removed.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/sections
export const addSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    const sectionsCount = await prisma.itinerarySection.count({ where: { tripStopId: req.body.tripStopId } });
    const section = await prisma.itinerarySection.create({
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : null,
        order: sectionsCount,
        estimatedBudget: req.body.estimatedBudget ? parseFloat(req.body.estimatedBudget) : null,
      },
      include: { activities: true },
    });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/trips/:id/sections/:sectionId
export const updateSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const section = await prisma.itinerarySection.update({
      where: { id: req.params.sectionId },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        estimatedBudget: req.body.estimatedBudget ? parseFloat(req.body.estimatedBudget) : undefined,
      },
      include: { activities: true },
    });
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id/sections/:sectionId
export const deleteSection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.itinerarySection.delete({ where: { id: req.params.sectionId } });
    res.json({ success: true, message: 'Section deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/activities
export const addActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activitiesCount = await prisma.activity.count({ where: { sectionId: req.body.sectionId } });
    const activity = await prisma.activity.create({
      data: { ...req.body, order: activitiesCount, cost: req.body.cost ? parseFloat(req.body.cost) : null },
    });
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/share
export const shareTrip = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!trip) return next(createError('Trip not found.', 404));

    const slug = uuid();
    const [shared] = await Promise.all([
      prisma.sharedItinerary.upsert({
        where: { tripId: req.params.id },
        create: { tripId: req.params.id, userId: req.user!.id, shareSlug: slug },
        update: { isActive: true },
      }),
      prisma.trip.update({ where: { id: req.params.id }, data: { isPublic: true, shareSlug: slug } }),
    ]);

    res.json({ success: true, data: { slug: shared.shareSlug, url: `/share/${shared.shareSlug}` } });
  } catch (err) {
    next(err);
  }
};
