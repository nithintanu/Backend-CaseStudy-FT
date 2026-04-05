jest.mock('../../src/services/AnalyticsService', () => ({
  __esModule: true,
  default: {
    getTotalIncome: jest.fn(),
    getTotalExpenses: jest.fn(),
    getNetBalance: jest.fn(),
    getCategoryTotals: jest.fn(),
    getRecentActivity: jest.fn(),
    getMonthlyTrends: jest.fn(),
    getDashboardSummary: jest.fn(),
    getAdminDashboard: jest.fn(),
  },
}));

import type { NextFunction, Request, Response } from 'express';
import AnalyticsController from '../../src/controllers/AnalyticsController';
import AnalyticsService from '../../src/services/AnalyticsService';

const mockedAnalyticsService = AnalyticsService as jest.Mocked<typeof AnalyticsService>;

const createResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

describe('AnalyticsController', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns total income', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getTotalIncome.mockResolvedValue(4000);

    await AnalyticsController.getTotalIncome(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ totalIncome: 4000 });
  });

  it('uses a sanitized recent activity limit', async () => {
    const req = { user: { id: 1 }, query: { limit: '3' } } as unknown as Request;
    const res = createResponse();
    mockedAnalyticsService.getRecentActivity.mockResolvedValue([]);

    await AnalyticsController.getRecentActivity(req, res, next);

    expect(mockedAnalyticsService.getRecentActivity).toHaveBeenCalledWith(1, 3);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('falls back to default recent activity limit for invalid input', async () => {
    const req = { user: { id: 1 }, query: { limit: '-1' } } as unknown as Request;
    const res = createResponse();
    mockedAnalyticsService.getRecentActivity.mockResolvedValue([]);

    await AnalyticsController.getRecentActivity(req, res, next);

    expect(mockedAnalyticsService.getRecentActivity).toHaveBeenCalledWith(1, 10);
  });

  it('returns total expenses', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getTotalExpenses.mockResolvedValue(1200);

    await AnalyticsController.getTotalExpenses(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ totalExpenses: 1200 });
  });

  it('returns net balance', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getNetBalance.mockResolvedValue(2800);

    await AnalyticsController.getNetBalance(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ netBalance: 2800 });
  });

  it('returns category totals', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getCategoryTotals.mockResolvedValue([{ category: 'Food', type: 'expense', total: 300 }]);

    await AnalyticsController.getCategoryTotals(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ category: 'Food', type: 'expense', total: 300 }]);
  });

  it('returns monthly trends', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getMonthlyTrends.mockResolvedValue([{ month: '2026-04', type: 'income', total: 4000 }]);

    await AnalyticsController.getMonthlyTrends(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ month: '2026-04', type: 'income', total: 4000 }]);
  });

  it('returns dashboard summary', async () => {
    const req = { user: { id: 1 } } as Request;
    const res = createResponse();
    mockedAnalyticsService.getDashboardSummary.mockResolvedValue({
      totalIncome: 5000,
      totalExpenses: 2000,
      netBalance: 3000,
      categoryTotals: [],
      recentActivity: [],
    });

    await AnalyticsController.getDashboardSummary(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns admin dashboard', async () => {
    const req = {} as Request;
    const res = createResponse();
    mockedAnalyticsService.getAdminDashboard.mockResolvedValue([]);

    await AnalyticsController.getAdminDashboard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
