import { Router } from 'express';
import { z } from 'zod';
import type { Location } from '@prisma/client';
import { prisma } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

// Pagination constants
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const router: Router = Router();

// Query schema
const listQuerySchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  priceLevel: z.string().optional(), // comma-separated numbers
  minRating: z.coerce.number().min(0).max(5).optional(),
  isAnvaVerified: z.coerce.boolean().optional(),
  isHiddenGem: z.coerce.boolean().optional(),
  isPopular: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  sortBy: z.enum(['name', 'rating', 'priceLevel', 'createdAt']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const searchQuerySchema = z.object({
  q: z.string().min(1),
  city: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const nearbyQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().min(0.1).max(50).default(5),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// GET /locations
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    
    const where: any = {};
    
    if (query.city) where.city = query.city;
    if (query.category) where.category = query.category;
    if (query.tags) where.tags = { hasSome: query.tags.split(',') };
    if (query.priceLevel) {
      where.priceLevel = { in: query.priceLevel.split(',').map(Number) };
    }
    if (query.minRating) where.rating = { gte: query.minRating };
    if (query.isAnvaVerified !== undefined) where.isAnvaVerified = query.isAnvaVerified;
    if (query.isHiddenGem !== undefined) where.isHiddenGem = query.isHiddenGem;
    if (query.isPopular !== undefined) where.isPopular = query.isPopular;

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.location.count({ where }),
    ]);

    res.json({
      success: true,
      data: locations,
      meta: {
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
          hasMore: query.page * query.limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/search
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const query = searchQuerySchema.parse(req.query);
    
    const where: any = {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' } },
        { nameLocal: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { tags: { hasSome: [query.q.toLowerCase()] } },
      ],
    };
    
    if (query.city) where.city = query.city;
    if (query.category) where.category = query.category;

    const locations = await prisma.location.findMany({
      where,
      take: query.limit,
      orderBy: { rating: 'desc' },
    });

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/nearby
router.get('/nearby', optionalAuth, async (req, res, next) => {
  try {
    const query = nearbyQuerySchema.parse(req.query);
    
    // Simple distance calculation using bounding box
    // In production, use PostGIS for accurate distance queries
    const latDelta = query.radiusKm / 111; // ~111km per degree latitude
    const lngDelta = query.radiusKm / (111 * Math.cos(query.lat * Math.PI / 180));
    
    const where: any = {
      latitude: {
        gte: query.lat - latDelta,
        lte: query.lat + latDelta,
      },
      longitude: {
        gte: query.lng - lngDelta,
        lte: query.lng + lngDelta,
      },
    };
    
    if (query.category) where.category = query.category;

    const locations = await prisma.location.findMany({
      where,
      take: query.limit,
      orderBy: { rating: 'desc' },
    });

    // Calculate actual distance and sort
    const locationsWithDistance = locations.map((loc: Location) => ({
      ...loc,
      distance: calculateDistance(query.lat, query.lng, loc.latitude, loc.longitude),
    })).filter((loc: Location & { distance: number }) => loc.distance <= query.radiusKm)
      .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);

    res.json({
      success: true,
      data: locationsWithDistance,
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.location.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    });

    res.json({
      success: true,
      data: categories.map((c: { category: string; _count: { category: number } }) => ({
        id: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/featured
router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const city = (req.query.city as string) || 'Danang';
    
    const [popular, hidden, verified] = await Promise.all([
      prisma.location.findMany({
        where: { city, isPopular: true },
        take: 6,
        orderBy: { rating: 'desc' },
      }),
      prisma.location.findMany({
        where: { city, isHiddenGem: true },
        take: 6,
        orderBy: { rating: 'desc' },
      }),
      prisma.location.findMany({
        where: { city, isAnvaVerified: true },
        take: 6,
        orderBy: { rating: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        popular,
        hiddenGems: hidden,
        anvaVerified: verified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /locations/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
    });

    if (!location) {
      throw AppError.notFound('Location not found');
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;

