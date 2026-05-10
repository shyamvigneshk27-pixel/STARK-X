import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate, ariaRequestSchema } from '../lib/validate';
import { planTripWithAria } from '../services/ariaService';
import { cacheFlushTrip } from '../lib/redis';
import { logger } from '../lib/logger';

const router = Router();

// ── POST /api/aria/plan ───────────────────────────────────────────────────────
router.post(
  '/plan',
  validate(ariaRequestSchema),
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const { tripId, message, history } = req.body;

    // Per-user rate limit is skipped when Redis is unavailable
    // (Redis is optional infrastructure for local dev)

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.userId },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: { city: true, activities: true },
        },
      },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    logger.info('ARIA request initiated', {
      userId: req.userId,
      tripId,
      messageLength: message.length,
      historyLength: history.length,
    });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (data: unknown): void => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    await planTripWithAria({
      trip,
      userMessage: message,
      history,
      onChunk: (text: string) => sendEvent({ type: 'chunk', content: text }),
      onError: (errMsg: string) => {
        sendEvent({ type: 'error', content: errMsg });
        res.write('data: [DONE]\n\n');
        res.end();
      },
      onItinerary: async (itinerary) => {
        try {
          // Upsert stops and activities from AI response
          for (let i = 0; i < itinerary.stops.length; i++) {
            const s = itinerary.stops[i];

            // Find or create city
            let city = await prisma.city.findFirst({
              where: { name: { equals: s.city } },
            });

            if (!city) {
              city = await prisma.city.create({
                data: {
                  name: s.city,
                  country: s.country || 'Unknown',
                  lat: 0,
                  lng: 0,
                  popularity: 50,
                  costIndex: 1.5,
                },
              });
            }

            const stop = await prisma.stop.create({
              data: {
                tripId: trip.id,
                cityId: city.id,
                arrivalDate: new Date(s.arrivalDate),
                departureDate: new Date(s.departureDate),
                order: i,
              },
            });

            for (const act of s.activities) {
              await prisma.activity.create({
                data: {
                  stopId: stop.id,
                  name: act.name,
                  type: act.type,
                  estimatedCost: act.estimatedCost ?? 0,
                  durationHrs: act.durationHrs ?? 1,
                  startTime: act.startTime || null,
                  notes: act.notes || null,
                },
              });
            }
          }

          await cacheFlushTrip(tripId);

          logger.info('ARIA itinerary saved', {
            userId: req.userId,
            tripId,
            stopsCreated: itinerary.stops.length,
            totalEstimatedCost: itinerary.totalEstimatedCost,
          });

          sendEvent({ type: 'itinerary_saved', stopsCount: itinerary.stops.length });
        } catch (err: unknown) {
          logger.error('Failed to save ARIA itinerary', { error: (err as Error).message });
          sendEvent({ type: 'error', content: 'Failed to save itinerary to database.' });
        }

        res.write('data: [DONE]\n\n');
        res.end();
      },
    });
  }
);

export default router;
