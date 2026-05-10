import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const DEFAULT_ITEMS = [
  { category: 'Documents', name: 'Passport' },
  { category: 'Documents', name: 'Flight Tickets (printed)' },
  { category: 'Documents', name: 'Travel Insurance' },
  { category: 'Documents', name: 'Hotel Booking Confirmation' },
  { category: 'Documents', name: 'Visa Documents' },
  { category: 'Clothing', name: 'Casual Shirts (5x)' },
  { category: 'Clothing', name: 'Trousers / Jeans' },
  { category: 'Clothing', name: 'Comfortable Walking Shoes' },
  { category: 'Clothing', name: 'Light Jacket / Windbreaker' },
  { category: 'Clothing', name: 'Swimwear' },
  { category: 'Electronics', name: 'Phone Charger' },
  { category: 'Electronics', name: 'Universal Power Adapter' },
  { category: 'Electronics', name: 'Earphone / Headphones' },
  { category: 'Electronics', name: 'Portable Battery Pack' },
  { category: 'Health', name: 'Prescription Medications' },
  { category: 'Health', name: 'First Aid Kit' },
  { category: 'Health', name: 'Sunscreen SPF 50+' },
  { category: 'Toiletries', name: 'Toothbrush & Toothpaste' },
  { category: 'Toiletries', name: 'Shampoo & Conditioner' },
  { category: 'Toiletries', name: 'Deodorant' },
  { category: 'Misc', name: 'Travel Pillow' },
  { category: 'Misc', name: 'Reusable Water Bottle' },
  { category: 'Misc', name: 'Snacks for Journey' },
];

// GET /api/checklists/:tripId
export const getChecklist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let checklist = await prisma.packingChecklist.findFirst({
      where: { tripId: req.params.tripId, userId: req.user!.id },
      include: { items: { orderBy: [{ category: 'asc' }, { name: 'asc' }] } },
    });

    if (!checklist) {
      checklist = await prisma.packingChecklist.create({
        data: {
          tripId: req.params.tripId,
          userId: req.user!.id,
          items: { create: DEFAULT_ITEMS },
        },
        include: { items: { orderBy: [{ category: 'asc' }, { name: 'asc' }] } },
      });
    }

    // Group by category
    const grouped = checklist.items.reduce((acc: Record<string, any[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const packed = checklist.items.filter(i => i.isPacked).length;
    res.json({
      success: true,
      data: { checklist, grouped, stats: { total: checklist.items.length, packed, remaining: checklist.items.length - packed } },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/checklists/:tripId/items
export const addItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const checklist = await prisma.packingChecklist.findFirst({ where: { tripId: req.params.tripId, userId: req.user!.id } });
    if (!checklist) return next(createError('Checklist not found.', 404));

    const item = await prisma.checklistItem.create({
      data: { checklistId: checklist.id, ...req.body },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/checklists/:tripId/items/:itemId
export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data: req.body,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/checklists/:tripId/items/:itemId
export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.checklistItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true, message: 'Item removed.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/checklists/:tripId/reset
export const resetChecklist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const checklist = await prisma.packingChecklist.findFirst({ where: { tripId: req.params.tripId, userId: req.user!.id } });
    if (!checklist) return next(createError('Checklist not found.', 404));

    await prisma.checklistItem.updateMany({ where: { checklistId: checklist.id }, data: { isPacked: false } });
    res.json({ success: true, message: 'Checklist reset.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/checklists/:tripId/sync
export const syncOfflineItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body; // Array of {id, isPacked, name, category}
    const checklist = await prisma.packingChecklist.findFirst({ where: { tripId: req.params.tripId, userId: req.user!.id } });
    if (!checklist) return next(createError('Checklist not found.', 404));

    const updates = items.map((item: any) =>
      prisma.checklistItem.upsert({
        where: { id: item.id || 'nonexistent' },
        create: { checklistId: checklist.id, name: item.name, category: item.category, isPacked: item.isPacked, isOfflineSynced: true },
        update: { isPacked: item.isPacked, isOfflineSynced: true },
      })
    );
    await Promise.all(updates);
    res.json({ success: true, message: 'Offline items synced.' });
  } catch (err) {
    next(err);
  }
};
