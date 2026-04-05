import { Router } from 'express';
import config from '../config';
import { checkDatabaseConnection } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import analyticsRoutes from './analytics';
import authRoutes from './auth';
import recordRoutes from './records';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/analytics', analyticsRoutes);

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    try {
      await checkDatabaseConnection();

      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.env,
        services: {
          database: 'up',
        },
      });
    } catch {
      res.status(503).json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        environment: config.env,
        services: {
          database: 'down',
        },
      });
    }
  }),
);

export default router;
