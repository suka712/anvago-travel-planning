import { Router } from 'express';
import { z } from 'zod';
import type { ItineraryItem } from '@prisma/client';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: Router = Router();

// Schemas
const createTripSchema = z.object({
  itineraryId: z.string(),
  scheduledStart: z.string().datetime(),
});

const updateTripSchema = z.object({
  status: z.enum(['scheduled', 'active', 'paused', 'completed', 'cancelled']).optional(),
  currentDayNumber: z.number().min(1).optional(),
  currentItemIndex: z.number().min(0).optional(),
});

const createEventSchema = z.object({
  type: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
});

// GET /trips
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const trips = await prisma.trip.findMany({
      where,
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
      orderBy: { scheduledStart: 'desc' },
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
});

// POST /trips
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createTripSchema.parse(req.body);
    
    // Get itinerary to count items
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: data.itineraryId },
      include: { items: true },
    });

    if (!itinerary) {
      throw AppError.notFound('Itinerary not found');
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user!.id,
        itineraryId: data.itineraryId,
        scheduledStart: new Date(data.scheduledStart),
        totalItems: itinerary.items.length,
      },
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
    });

    // Create initial event
    await prisma.tripEvent.create({
      data: {
        tripId: trip.id,
        type: 'trip_created',
        message: `Trip scheduled for ${new Date(data.scheduledStart).toLocaleDateString()}`,
      },
    });

    res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
});

// GET /trips/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        itinerary: {
          include: {
            items: {
              include: { location: true },
              orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            },
          },
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!trip) {
      throw AppError.notFound('Trip not found');
    }

    if (trip.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    res.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:id
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const data = updateTripSchema.parse(req.body);
    
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
    });

    if (!trip) {
      throw AppError.notFound('Trip not found');
    }

    if (trip.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const updateData: any = { ...data };
    
    // Handle status changes
    if (data.status === 'active' && trip.status !== 'active') {
      updateData.actualStart = new Date();
    } else if (data.status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: updateData,
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
    });

    // Create event for status change
    if (data.status && data.status !== trip.status) {
      await prisma.tripEvent.create({
        data: {
          tripId: trip.id,
          type: `trip_${data.status}`,
          message: `Trip status changed to ${data.status}`,
        },
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// POST /trips/:id/advance
router.post('/:id/advance', requireAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        itinerary: {
          include: {
            items: {
              orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            },
          },
        },
      },
    });

    if (!trip) {
      throw AppError.notFound('Trip not found');
    }

    if (trip.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const items = trip.itinerary.items;
    const currentIndex = items.findIndex(
      (item: ItineraryItem) => item.dayNumber === trip.currentDayNumber &&
              item.orderIndex === trip.currentItemIndex
    );

    if (currentIndex === -1 || currentIndex >= items.length - 1) {
      // Trip completed
      const updated = await prisma.trip.update({
        where: { id: req.params.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          completedItems: trip.completedItems + 1,
        },
      });

      await prisma.tripEvent.create({
        data: {
          tripId: trip.id,
          type: 'trip_completed',
          message: 'Congratulations! You completed your trip!',
        },
      });

      return res.json({
        success: true,
        data: { ...updated, isComplete: true },
      });
    }

    // Move to next item
    const nextItem = items[currentIndex + 1];
    
    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        currentDayNumber: nextItem.dayNumber,
        currentItemIndex: nextItem.orderIndex,
        completedItems: trip.completedItems + 1,
      },
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
    });

    await prisma.tripEvent.create({
      data: {
        tripId: trip.id,
        type: 'location_departed',
        message: `Moving to next destination`,
        data: { nextLocationId: nextItem.locationId },
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

// GET /trips/:id/events
router.get('/:id/events', requireAuth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
    });

    if (!trip || trip.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const events = await prisma.tripEvent.findMany({
      where: { tripId: req.params.id },
      orderBy: { timestamp: 'desc' },
      take: Number(req.query.limit) || 50,
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// POST /trips/:id/events
router.post('/:id/events', requireAuth, async (req, res, next) => {
  try {
    const data = createEventSchema.parse(req.body);
    
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
    });

    if (!trip || trip.userId !== req.user!.id) {
      throw AppError.forbidden('Access denied');
    }

    const event = await prisma.tripEvent.create({
      data: {
        tripId: req.params.id,
        type: data.type,
        message: data.message,
        data: data.data as any,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

