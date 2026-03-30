import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: Router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
});

const updatePreferencesSchema = z.object({
  personas: z.array(z.string()).optional(),
  vibePreferences: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  budgetLevel: z.enum(['budget', 'moderate', 'luxury']).optional(),
  mobilityLevel: z.enum(['low', 'moderate', 'high']).optional(),
  groupSize: z.number().min(1).max(20).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
});

// GET /users/me
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
        premiumUntil: user.premiumUntil,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/me
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /users/me/preferences
router.get('/me/preferences', requireAuth, async (req, res, next) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /users/me/preferences
router.put('/me/preferences', requireAuth, async (req, res, next) => {
  try {
    const data = updatePreferencesSchema.parse(req.body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: {
        userId: req.user!.id,
        ...data,
        personas: data.personas || [],
        vibePreferences: data.vibePreferences || [],
        interests: data.interests || [],
        dietaryRestrictions: data.dietaryRestrictions || [],
        accessibilityNeeds: data.accessibilityNeeds || [],
      },
    });

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
});


export default router;

