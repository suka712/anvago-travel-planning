import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import type { User as PrismaUser } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'anvago-secret-key';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User extends Omit<PrismaUser, 'passwordHash'> {}
  }
}

type User = PrismaUser;

export interface JwtPayload {
  sub: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

// Required authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(AppError.unauthorized('Authentication required'));
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Optional authentication - attaches user if token present
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Admin only
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(AppError.unauthorized('Authentication required'));
    }
    if (!user.isAdmin) {
      return next(AppError.forbidden('Admin access required'));
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Premium only
export const requirePremium = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(AppError.unauthorized('Authentication required'));
    }
    if (!user.isPremium && !user.isAdmin) {
      return next(AppError.forbidden('Premium subscription required'));
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Generate JWT tokens
export function generateTokens(user: User) {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    isPremium: user.isPremium,
    isAdmin: user.isAdmin,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'] }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

// Verify refresh token
export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}

