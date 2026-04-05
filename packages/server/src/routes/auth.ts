import { Router } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { generateTokens, verifyRefreshToken, requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse, LoginResponse } from '@anvago/shared';

const router: Router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user);

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? undefined,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        },
        tokens,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? undefined,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        },
        tokens,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    // In a real app, we'd invalidate the refresh token here
    // For now, just return success
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw AppError.badRequest('Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { preferences: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
        premiumUntil: user.premiumUntil,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: Error, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const tokens = generateTokens(user);
    
    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params.toString()}`);
  })(req, res, next);
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email'],
  session: false,
}));

router.get('/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (err: Error, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const tokens = generateTokens(user);
    
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params.toString()}`);
  })(req, res, next);
});

export default router;

