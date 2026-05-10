import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate, registerSchema, loginSchema, updateProfileSchema } from '../lib/validate';
import { logger } from '../lib/logger';

const router = Router();

const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_limit',
  points: 10,
  duration: 900,
});

function generateToken(userId: string, isAdmin: boolean): string {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    await authLimiter.consume(req.ip || 'unknown');
  } catch {
    res.status(429).json({ error: 'Too many registration attempts. Try again later.' });
    return;
  }

  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(400).json({ error: 'Email already in use' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true, createdAt: true },
  });

  const token = generateToken(user.id, user.isAdmin);
  logger.info('User registered', { userId: user.id, email: user.email });

  res.status(201).json({ user, token });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    await authLimiter.consume(req.ip || 'unknown');
  } catch {
    res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    return;
  }

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user.id, user.isAdmin);
  logger.info('User logged in', { userId: user.id });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      language: user.language,
      isAdmin: user.isAdmin,
    },
    token,
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch('/profile', requireAuth, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const { name, avatarUrl, language } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name && { name }),
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      ...(language && { language }),
    },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true },
  });

  logger.info('User profile updated', { userId: req.userId });
  res.json(user);
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', requireAuth, (_req: AuthRequest, res: Response) => {
  // Stateless JWT — token invalidation would require a blocklist in Redis
  // For now, client drops the token
  res.json({ message: 'Logged out successfully' });
});

// ── PATCH /api/auth/me (alias for profile) ────────────────────────────────────
router.patch('/me', requireAuth, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const { name, avatarUrl, language } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(name && { name }),
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      ...(language && { language }),
    },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true },
  });

  res.json(user);
});

export default router;
