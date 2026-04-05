import type { Request, Response } from 'express';
import AnalyticsService from '../services/AnalyticsService';
import { asyncHandler } from '../utils/asyncHandler';

const AnalyticsController = {
  getTotalIncome: asyncHandler(async (req: Request, res: Response) => {
    const total = await AnalyticsService.getTotalIncome(req.user!.id);
    res.status(200).json({ totalIncome: total });
  }),

  getTotalExpenses: asyncHandler(async (req: Request, res: Response) => {
    const total = await AnalyticsService.getTotalExpenses(req.user!.id);
    res.status(200).json({ totalExpenses: total });
  }),

  getNetBalance: asyncHandler(async (req: Request, res: Response) => {
    const balance = await AnalyticsService.getNetBalance(req.user!.id);
    res.status(200).json({ netBalance: balance });
  }),

  getCategoryTotals: asyncHandler(async (req: Request, res: Response) => {
    const totals = await AnalyticsService.getCategoryTotals(req.user!.id);
    res.status(200).json(totals);
  }),

  getRecentActivity: asyncHandler(async (req: Request, res: Response) => {
    const rawLimit = req.query.limit ? Number(req.query.limit) : 10;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const activity = await AnalyticsService.getRecentActivity(req.user!.id, limit);

    res.status(200).json(activity);
  }),

  getMonthlyTrends: asyncHandler(async (req: Request, res: Response) => {
    const trends = await AnalyticsService.getMonthlyTrends(req.user!.id);
    res.status(200).json(trends);
  }),

  getDashboardSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await AnalyticsService.getDashboardSummary(req.user!.id);
    res.status(200).json(summary);
  }),

  getAdminDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const dashboard = await AnalyticsService.getAdminDashboard();
    res.status(200).json(dashboard);
  }),
};

export default AnalyticsController;
