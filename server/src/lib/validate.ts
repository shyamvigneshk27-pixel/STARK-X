import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      'Password must contain at least one uppercase letter and one number'
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja']).optional(),
});

export const createTripSchema = z.object({
  name: z.string().min(2, 'Trip name too short').max(100, 'Trip name too long'),
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  totalBudget: z.number().min(0).optional().default(0),
  description: z.string().max(500).optional(),
  coverPhoto: z.string().url().optional().or(z.literal('')),
});

export const createStopSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID'),
  cityId: z.string().uuid('Invalid city ID'),
  arrivalDate: z.string().min(1, 'Arrival date required'),
  departureDate: z.string().min(1, 'Departure date required'),
  order: z.number().int().min(0),
});

export const createActivitySchema = z.object({
  stopId: z.string().uuid('Invalid stop ID'),
  name: z.string().min(1, 'Activity name required').max(200, 'Name too long'),
  type: z.enum([
    'sightseeing',
    'food',
    'adventure',
    'culture',
    'nightlife',
    'transport',
    'accommodation',
  ]),
  estimatedCost: z.number().min(0),
  durationHrs: z.number().min(0.5),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional(),
  notes: z.string().max(500).optional(),
});

export const ariaRequestSchema = z.object({
  tripId: z.string().uuid('Invalid trip ID'),
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20, 'History too long'),
});

export const createNoteSchema = z.object({
  tripId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  stopId: z.string().uuid().optional(),
});

export const createChecklistItemSchema = z.object({
  tripId: z.string().uuid(),
  label: z.string().min(1).max(200),
  category: z.enum(['clothing', 'documents', 'electronics', 'general']).optional().default('general'),
});

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
