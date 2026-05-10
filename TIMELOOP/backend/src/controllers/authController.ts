import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const generateTokens = (payload: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

const userSelect = {
  id: true, email: true, firstName: true, lastName: true,
  phone: true, city: true, country: true, bio: true,
  avatarUrl: true, role: true, isVerified: true, createdAt: true,
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, city, country } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next(createError('Email already registered.', 409));

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, city, country },
      select: userSelect,
    });

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, ...tokens },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(createError('Invalid email or password.', 401));

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return next(createError('Invalid email or password.', 401));

    const { passwordHash: _, ...safeUser } = user;
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: safeUser, ...tokens },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('Refresh token required.', 401));

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string; email: string; role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });
    if (!user) return next(createError('User not found.', 401));

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(createError('Invalid refresh token.', 401));
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
      return;
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' } as jwt.SignOptions);
    const resetTokenExp = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // In production, send email here with resetToken
    // For demo: just return the token
    res.json({
      success: true,
      message: 'If that email exists, a reset link was sent.',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, resetToken: token, resetTokenExp: { gt: new Date() } },
    });

    if (!user) return next(createError('Invalid or expired reset token.', 400));

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    next(createError('Invalid or expired reset token.', 400));
  }
};
