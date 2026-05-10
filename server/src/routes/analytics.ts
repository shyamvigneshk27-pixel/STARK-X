import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import type { Request } from 'express';

const router = Router();

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

// In-memory rotating buffer (max 1000 events)
const eventBuffer: AnalyticsEvent[] = [];
const MAX_EVENTS = 1000;

function pushEvent(event: AnalyticsEvent): void {
  if (eventBuffer.length >= MAX_EVENTS) {
    eventBuffer.shift(); // rotate oldest
  }
  eventBuffer.push(event);
}

// ── POST /api/analytics/event ─────────────────────────────────────────────────
router.post('/event', requireAuth, async (req: AuthRequest, res: Response) => {
  const { event, properties = {} } = req.body;

  if (!event || typeof event !== 'string') {
    res.status(400).json({ error: 'event field is required' });
    return;
  }

  const analyticsEvent: AnalyticsEvent = {
    event,
    userId: req.userId,
    properties,
    timestamp: new Date().toISOString(),
  };

  pushEvent(analyticsEvent);
  logger.info('Analytics event', analyticsEvent);

  res.json({ success: true });
});

// ── GET /api/analytics/summary ────────────────────────────────────────────────
router.get('/summary', requireAdmin, (_req: Request, res: Response) => {
  const summary: Record<string, number> = {};

  eventBuffer.forEach(({ event }) => {
    summary[event] = (summary[event] ?? 0) + 1;
  });

  const sorted = Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .map(([event, count]) => ({ event, count }));

  res.json({
    totalEvents: eventBuffer.length,
    events: sorted,
    uniqueUsers: new Set(eventBuffer.map((e) => e.userId).filter(Boolean)).size,
  });
});

export default router;
