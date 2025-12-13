import { Router } from 'express';
import { z } from 'zod';
import type { ItineraryItem } from '@prisma/client';
import { prisma } from '../config/database.js';
import { requireAuth, optionalAuth, requirePremium } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateItinerary, optimizeItinerary, localizeItinerary } from '../services/ai.js';

const router: Router = Router();

// Schemas
const createItinerarySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  city: z.string().default('Danang'),
  durationDays: z.number().min(1).max(14),
  startDate: z.string().datetime().optional(),
});

const addItemSchema = z.object({
  locationId: z.string(),
  dayNumber: z.number().min(1),
  orderIndex: z.number().min(0),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
  transportMode: z.string().optional(),
});

const reorderItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    dayNumber: z.number(),
    orderIndex: z.number(),
  })),
});

// GET /itineraries/templates
router.get('/templates', async (req, res, next) => {
  try {
    const cityParam = (req.query.city as string) || 'Danang';
    // Normalize city to match database format (capitalize first letter)
    const city = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();

    const templates = await prisma.itineraryTemplate.findMany({
      where: { city, isActive: true },
      include: {
        itinerary: {
          include: {
            items: {
              include: { location: true },
              orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
});

// GET /itineraries/templates/suggested - Get personalized template suggestions
router.get('/templates/suggested', optionalAuth, async (req, res, next) => {
  try {
    const cityParam = (req.query.city as string) || 'Danang';
    // Normalize city to match database format (capitalize first letter)
    const city = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();
    const personas = (req.query.personas as string)?.split(',').filter(Boolean) || [];
    const vibes = (req.query.vibes as string)?.split(',').filter(Boolean) || [];
    const budget = req.query.budget as string;
    const interests = (req.query.interests as string)?.split(',').filter(Boolean) || [];
    const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

    // Get all active templates for the city
    const allTemplates = await prisma.itineraryTemplate.findMany({
      where: { city, isActive: true },
      include: {
        itinerary: {
          include: {
            items: {
              include: { location: true },
              orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Score and rank templates based on user preferences
    const scoredTemplates = allTemplates.map((template) => {
      let score = 0;
      let matchedCriteria: string[] = [];

      // Match personas (high weight)
      if (personas.length > 0 && template.targetPersonas) {
        const matchedPersonas = personas.filter((p) =>
          (template.targetPersonas as string[]).includes(p)
        );
        score += matchedPersonas.length * 25;
        if (matchedPersonas.length > 0) {
          matchedCriteria.push(`persona: ${matchedPersonas.join(', ')}`);
        }
      }

      // Match vibes (high weight)
      if (vibes.length > 0 && template.targetVibes) {
        const matchedVibes = vibes.filter((v) =>
          (template.targetVibes as string[]).includes(v)
        );
        score += matchedVibes.length * 20;
        if (matchedVibes.length > 0) {
          matchedCriteria.push(`vibe: ${matchedVibes.join(', ')}`);
        }
      }

      // Match budget (medium weight)
      if (budget && template.targetBudget) {
        if (template.targetBudget === budget) {
          score += 15;
          matchedCriteria.push(`budget: ${budget}`);
        }
      }

      // Match interests (medium weight)
      if (interests.length > 0 && template.targetInterests) {
        const matchedInterests = interests.filter((i) =>
          (template.targetInterests as string[]).includes(i)
        );
        score += matchedInterests.length * 10;
        if (matchedInterests.length > 0) {
          matchedCriteria.push(`interests: ${matchedInterests.join(', ')}`);
        }
      }

      // Match duration (bonus)
      if (duration && template.durationDays) {
        if (template.durationDays === duration) {
          score += 10;
          matchedCriteria.push(`duration: ${duration} days`);
        } else if (Math.abs(template.durationDays - duration) <= 1) {
          score += 5;
        }
      }

      // Calculate match percentage (normalize to 0-100)
      const maxPossibleScore =
        (personas.length || 1) * 25 +
        (vibes.length || 1) * 20 +
        15 +
        (interests.length || 1) * 10 +
        10;
      const matchPercentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

      return {
        ...template,
        matchScore: matchPercentage,
        matchedCriteria,
      };
    });

    // Sort by score (descending) and return
    const sortedTemplates = scoredTemplates.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: sortedTemplates,
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries/generate
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const preferences = req.body;
    
    const result = await generateItinerary(preferences);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /itineraries (user's itineraries)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createItinerarySchema.parse(req.body);
    
    const itinerary = await prisma.itinerary.create({
      data: {
        ...data,
        userId: req.user!.id,
        startDate: data.startDate ? new Date(data.startDate) : null,
        generatedBy: 'user',
      },
      include: {
        items: {
          include: { location: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
});

// GET /itineraries/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    // Check access
    if (!itinerary.isPublic && !itinerary.isTemplate) {
      if (!req.user || itinerary.userId !== req.user.id) {
        throw AppError.forbidden('Access denied');
      }
    }

    res.json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /itineraries/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    if (itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await prisma.itinerary.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /itineraries/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    if (itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    await prisma.itinerary.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      data: { message: 'Itinerary deleted' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries/:id/duplicate
router.post('/:id/duplicate', requireAuth, async (req, res, next) => {
  try {
    const original = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!original) {
      throw AppError.notFound('Itinerary not found');
    }

    // Create duplicate
    const duplicate = await prisma.itinerary.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        city: original.city,
        durationDays: original.durationDays,
        coverImage: original.coverImage,
        userId: req.user!.id,
        generatedBy: 'user',
        items: {
          create: original.items.map((item: ItineraryItem) => ({
            locationId: item.locationId,
            dayNumber: item.dayNumber,
            orderIndex: item.orderIndex,
            startTime: item.startTime,
            endTime: item.endTime,
            notes: item.notes,
            transportMode: item.transportMode,
            transportDuration: item.transportDuration,
            transportCost: item.transportCost,
          })),
        },
      },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    res.status(201).json({
      success: true,
      data: duplicate,
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries/:id/optimize (Premium)
router.post('/:id/optimize', requirePremium, async (req, res, next) => {
  try {
    const { criterion } = req.body;
    
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    if (itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const result = await optimizeItinerary(itinerary, criterion);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries/:id/localize (Premium)
router.post('/:id/localize', requirePremium, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    if (itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const suggestions = await localizeItinerary(itinerary);
    
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
});

// === Item Routes ===

// POST /itineraries/:id/items
router.post('/:id/items', requireAuth, async (req, res, next) => {
  try {
    const data = addItemSchema.parse(req.body);
    
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    if (itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const item = await prisma.itineraryItem.create({
      data: {
        ...data,
        itineraryId: req.params.id,
      },
      include: { location: true },
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /itineraries/:id/items/:itemId
router.patch('/:id/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary || itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const item = await prisma.itineraryItem.update({
      where: { id: req.params.itemId },
      data: req.body,
      include: { location: true },
    });

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /itineraries/:id/items/:itemId
router.delete('/:id/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary || itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    await prisma.itineraryItem.delete({
      where: { id: req.params.itemId },
    });

    res.json({
      success: true,
      data: { message: 'Item removed' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /itineraries/:id/items/reorder
router.post('/:id/items/reorder', requireAuth, async (req, res, next) => {
  try {
    const { items } = reorderItemsSchema.parse(req.body);
    
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
    });

    if (!itinerary || itinerary.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    // Update all items in a transaction
    await prisma.$transaction(
      items.map(item => 
        prisma.itineraryItem.update({
          where: { id: item.id },
          data: {
            dayNumber: item.dayNumber,
            orderIndex: item.orderIndex,
          },
        })
      )
    );

    const updated = await prisma.itinerary.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { location: true },
          orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// GET /itineraries/:id/items/:itemId/alternatives
router.get('/:id/items/:itemId/alternatives', requireAuth, async (req, res, next) => {
  try {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: req.params.itemId },
      include: { location: true },
    });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    const { type } = req.query; // 'category', 'price', 'area', 'rating'
    
    const where: any = {
      id: { not: item.locationId },
      city: item.location.city,
    };

    switch (type) {
      case 'category':
        where.category = item.location.category;
        break;
      case 'price':
        where.priceLevel = item.location.priceLevel;
        break;
      case 'area':
        // Within ~2km
        where.latitude = { gte: item.location.latitude - 0.02, lte: item.location.latitude + 0.02 };
        where.longitude = { gte: item.location.longitude - 0.02, lte: item.location.longitude + 0.02 };
        break;
      default:
        where.category = item.location.category;
    }

    const alternatives = await prisma.location.findMany({
      where,
      take: 10,
      orderBy: { rating: 'desc' },
    });

    res.json({
      success: true,
      data: alternatives,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

