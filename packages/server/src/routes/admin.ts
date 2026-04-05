import { Router } from 'express';
import type { Prisma, ItineraryItem } from '@prisma/client';
import { prisma } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import type { AdminStats } from '@anvago/shared';

const router: Router = Router();

// GET /admin/stats
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [
      totalUsers,
      premiumUsers,
      totalItineraries,
      templateItineraries,
      totalTrips,
      activeTrips,
      completedTrips,
      totalLocations,
      verifiedLocations,
      categoryStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.itinerary.count(),
      prisma.itinerary.count({ where: { isTemplate: true } }),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'active' } }),
      prisma.trip.count({ where: { status: 'completed' } }),
      prisma.location.count(),
      prisma.location.count({ where: { isAnvaVerified: true } }),
      prisma.location.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ]);

    // Count new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await prisma.user.count({
      where: { createdAt: { gte: today } },
    });

    const stats: AdminStats = {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        newToday,
      },
      itineraries: {
        total: totalItineraries,
        templates: templateItineraries,
        generated: totalItineraries - templateItineraries,
      },
      trips: {
        total: totalTrips,
        active: activeTrips,
        completed: completedTrips,
      },
      locations: {
        total: totalLocations,
        verified: verifiedLocations,
        categories: Object.fromEntries(
          categoryStats.map((c: { category: string; _count: { category: number } }) => [c.category, c._count.category])
        ),
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/users
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            itineraries: true,
            trips: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /admin/users/:id/toggle-premium
router.patch('/users/:id/toggle-premium', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isPremium: !user.isPremium,
        premiumUntil: !user.isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      select: { id: true, email: true, name: true, isPremium: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ success: false, error: 'Cannot delete admin users' });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.tripEvent.deleteMany({ where: { trip: { userId: user.id } } });
      await tx.trip.deleteMany({ where: { userId: user.id } });
      await tx.itineraryItem.deleteMany({ where: { itinerary: { userId: user.id } } });
      await tx.itinerary.deleteMany({ where: { userId: user.id, isTemplate: false } });
      await tx.mockBooking.deleteMany({ where: { userId: user.id } });
      await tx.payment.deleteMany({ where: { userId: user.id } });
      await tx.userPreferences.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });

    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (error) {
    next(error);
  }
});

// GET /admin/itineraries
router.get('/itineraries', requireAdmin, async (req, res, next) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { items: true, trips: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/trips
router.get('/trips', requireAdmin, async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        itinerary: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/locations
router.get('/locations', requireAdmin, async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
});

// POST /admin/demo/reset
router.post('/demo/reset', requireAdmin, async (req, res, next) => {
  try {
    // Reset demo data - delete non-admin users and their data
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get non-admin users
      const users = await tx.user.findMany({
        where: { isAdmin: false },
        select: { id: true },
      });
      const userIds = users.map((u: { id: string }) => u.id);

      // Delete trips and events
      await tx.tripEvent.deleteMany({
        where: { trip: { userId: { in: userIds } } },
      });
      await tx.trip.deleteMany({
        where: { userId: { in: userIds } },
      });

      // Delete itinerary items and itineraries
      await tx.itineraryItem.deleteMany({
        where: { itinerary: { userId: { in: userIds } } },
      });
      await tx.itinerary.deleteMany({
        where: { userId: { in: userIds }, isTemplate: false },
      });

      // Delete mock bookings
      await tx.mockBooking.deleteMany({
        where: { userId: { in: userIds } },
      });

      // Delete preferences and users
      await tx.userPreferences.deleteMany({
        where: { userId: { in: userIds } },
      });
      
      const deletedUsers = await tx.user.deleteMany({
        where: { isAdmin: false },
      });

      return {
        users: deletedUsers.count,
      };
    });

    res.json({
      success: true,
      data: {
        message: 'Demo data reset successfully',
        resetItems: result,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /admin/demo/simulate
router.post('/demo/simulate', requireAdmin, async (req, res, next) => {
  try {
    const { tripId, action, payload } = req.body;
    
    // Update or create demo state
    const demoState = await prisma.demoState.upsert({
      where: { id: 'singleton' },
      create: {
        isActive: true,
        activeTripId: tripId,
      },
      update: {
        isActive: true,
        activeTripId: tripId,
        ...payload,
      },
    });

    // Handle specific actions
    switch (action) {
      case 'trigger_weather':
        await prisma.demoState.update({
          where: { id: 'singleton' },
          data: {
            weatherOverride: payload.weather,
          },
        });
        break;
        
      case 'trigger_traffic':
        await prisma.demoState.update({
          where: { id: 'singleton' },
          data: {
            trafficOverride: payload.traffic,
          },
        });
        break;

      case 'advance_location':
        if (tripId) {
          // Auto-advance trip to next location
          const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: { itinerary: { include: { items: true } } },
          });
          
          if (trip) {
            const items = trip.itinerary.items;
            const currentIdx = items.findIndex(
              (i: ItineraryItem) => i.dayNumber === trip.currentDayNumber &&
                   i.orderIndex === trip.currentItemIndex
            );
            
            if (currentIdx < items.length - 1) {
              const next = items[currentIdx + 1];
              await prisma.trip.update({
                where: { id: tripId },
                data: {
                  currentDayNumber: next.dayNumber,
                  currentItemIndex: next.orderIndex,
                  completedItems: trip.completedItems + 1,
                },
              });
            }
          }
        }
        break;
    }

    res.json({
      success: true,
      data: demoState,
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/demo/state
router.get('/demo/state', requireAdmin, async (req, res, next) => {
  try {
    const state = await prisma.demoState.findUnique({
      where: { id: 'singleton' },
    });

    res.json({
      success: true,
      data: state || { isActive: false },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

