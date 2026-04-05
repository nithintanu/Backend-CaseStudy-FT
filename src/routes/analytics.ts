import { Router } from 'express';
import AnalyticsController from '../controllers/AnalyticsController';
import verifyJWT from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/authorization';

const router = Router();

router.use(verifyJWT);

router.get('/summary', requirePermission('view_analytics'), AnalyticsController.getDashboardSummary);
router.get('/income', requirePermission('view_analytics'), AnalyticsController.getTotalIncome);
router.get('/expenses', requirePermission('view_analytics'), AnalyticsController.getTotalExpenses);
router.get('/balance', requirePermission('view_analytics'), AnalyticsController.getNetBalance);
router.get('/categories', requirePermission('view_analytics'), AnalyticsController.getCategoryTotals);
router.get('/recent', requirePermission('view_analytics'), AnalyticsController.getRecentActivity);
router.get('/trends', requirePermission('view_analytics'), AnalyticsController.getMonthlyTrends);
router.get('/admin/dashboard', requireRole('admin'), AnalyticsController.getAdminDashboard);

export default router;
