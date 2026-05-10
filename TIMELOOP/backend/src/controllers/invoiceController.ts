import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

// GET /api/invoices/:tripId
export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { tripId: req.params.tripId, userId: req.user!.id },
      orderBy: { generatedAt: 'desc' },
    });
    res.json({ success: true, data: invoices });
  } catch (err) { next(err); }
};

// POST /api/invoices/:tripId/generate
export const generateInvoice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user!.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        stops: { orderBy: { order: 'asc' } },
        budget: true,
        expenses: true,
      },
    });
    if (!trip) return next(createError('Trip not found.', 404));

    const totalAmount = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const breakdown = trip.expenses.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const invoiceNumber = `TL-${Date.now().toString(36).toUpperCase()}-${req.user!.id.slice(-4).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        tripId: trip.id,
        userId: req.user!.id,
        invoiceNumber,
        totalAmount,
        currency: trip.currency,
        breakdown,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        invoice,
        trip: {
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          currency: trip.currency,
          traveler: trip.user,
          stops: trip.stops.map(s => s.cityName),
          budget: trip.budget,
          expenses: trip.expenses,
          breakdown,
          totalAmount,
        },
      },
    });
  } catch (err) { next(err); }
};
