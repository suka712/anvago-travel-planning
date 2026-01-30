import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import locationRoutes from './locations.js';
import itineraryRoutes from './itineraries.js';
import tripRoutes from './trips.js';
import onboardingRoutes from './onboarding.js';
import integrationRoutes from './integrations.js';
import adminRoutes from './admin.js';
import externalRoutes from './external.js';
import foodRoutes from './food.js';

const router: Router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/trips', tripRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/integrations', integrationRoutes);
router.use('/admin', adminRoutes);
router.use('/external', externalRoutes);
router.use('/food', foodRoutes);

// API info
router.get('/', (_, res) => {
  res.json({
    success: true,
    data: {
      name: 'Anvago API',
      version: '1.0.0',
      description: 'Travel the world your way',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        locations: '/api/v1/locations',
        itineraries: '/api/v1/itineraries',
        trips: '/api/v1/trips',
        onboarding: '/api/v1/onboarding',
        integrations: '/api/v1/integrations',
        admin: '/api/v1/admin',
        external: '/api/v1/external',
        food: '/api/v1/food',
      },
    },
  });
});

export default router;

