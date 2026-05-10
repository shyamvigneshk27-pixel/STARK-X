import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';

import { errorHandler } from './middleware/errorHandler';
import { logger, httpLogger } from './lib/logger';

import authRoutes from './routes/auth';
import tripsRoutes from './routes/trips';
import stopsRoutes from './routes/stops';
import activitiesRoutes from './routes/activities';
import citiesRoutes from './routes/cities';
import budgetRoutes from './routes/budget';
import notesRoutes from './routes/notes';
import checklistRoutes from './routes/checklist';
import ariaRoutes from './routes/aria';
import shareRoutes from './routes/share';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';

dotenv.config({ override: true });

const app = express();

// ── Security & Compression ───────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // SSE streams require relaxed CSP
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4173', credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ── HTTP Logger ───────────────────────────────────────────────────────────────
app.use(httpLogger);

// ── Global Rate Limiter (in-memory, Redis-free) ──────────────────────────────
const globalRateLimiter = new RateLimiterMemory({
  keyPrefix: 'rl_global',
  points: 200,
  duration: 900,
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting for SSE endpoint (it has own control)
  if (req.path === '/api/aria/plan') return next();

  try {
    await globalRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    if (rejRes instanceof Error) {
      // Redis connection error, bypass rate limiting
      next();
    } else {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
  }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/stops', stopsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/aria', ariaRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Traveloop server listening on port ${PORT}`, {
    env: process.env.NODE_ENV,
    port: PORT,
  });
});

// ── Unhandled Rejections ──────────────────────────────────────────────────────
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection', { reason });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
