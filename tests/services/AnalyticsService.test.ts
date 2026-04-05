jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

import AnalyticsService from '../../src/services/AnalyticsService';
import { query } from '../../src/config/database';

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns numeric total income', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ total: '1250.50' }],
      rowCount: 1,
    } as never);

    const result = await AnalyticsService.getTotalIncome(1);

    expect(result).toBe(1250.5);
    expect(mockedQuery.mock.calls[0][0]).toContain('deleted_at IS NULL');
  });

  it('builds a dashboard summary from aggregated sources', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ total: '3000' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ total: '1200' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ category: 'Salary', type: 'income', total: '3000' }],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            user_id: 1,
            amount: 3000,
            type: 'income',
            category: 'Salary',
            description: 'Monthly salary',
            date: new Date('2026-04-01T00:00:00.000Z'),
            currency: 'USD',
            created_at: new Date('2026-04-01T00:00:00.000Z'),
            deleted_at: null,
          },
        ],
        rowCount: 1,
      } as never);

    const summary = await AnalyticsService.getDashboardSummary(1);

    expect(summary.totalIncome).toBe(3000);
    expect(summary.totalExpenses).toBe(1200);
    expect(summary.netBalance).toBe(1800);
    expect(summary.categoryTotals[0].total).toBe(3000);
    expect(summary.recentActivity).toHaveLength(1);
  });

  it('maps admin dashboard totals into numbers', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          record_count: '5',
          total_income: '4500',
          total_expenses: '900',
        },
      ],
      rowCount: 1,
    } as never);

    const result = await AnalyticsService.getAdminDashboard();

    expect(result[0]).toEqual({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      record_count: 5,
      total_income: 4500,
      total_expenses: 900,
    });
    expect(mockedQuery.mock.calls[0][0]).toContain('fr.deleted_at IS NULL');
  });
});
