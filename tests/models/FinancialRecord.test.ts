jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

import FinancialRecord from '../../src/models/FinancialRecord';
import { query } from '../../src/config/database';
import { AppError } from '../../src/errors/AppError';

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe('FinancialRecord model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds filtered paginated user queries', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await FinancialRecord.findByUserId(7, {
      type: 'expense',
      category: 'Food',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      query: 'lunch',
      page: 2,
      limit: 5,
    });

    const sql = mockedQuery.mock.calls[0][0];
    const params = mockedQuery.mock.calls[0][1];

    expect(sql).toContain('deleted_at IS NULL');
    expect(sql).toContain('user_id = $1');
    expect(sql).toContain('ILIKE');
    expect(sql).toContain('LIMIT $7');
    expect(sql).toContain('OFFSET $8');
    expect(params).toEqual([7, 'expense', 'Food', '2026-04-01', '2026-04-30', '%lunch%', 5, 5]);
  });

  it('soft deletes records', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 9 }],
      rowCount: 1,
    } as never);

    const result = await FinancialRecord.delete(9);

    expect(result).toEqual({ id: 9 });
    expect(mockedQuery.mock.calls[0][0]).toContain('SET deleted_at = NOW()');
  });

  it('creates records', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, deleted_at: null }],
      rowCount: 1,
    } as never);

    const result = await FinancialRecord.create({
      user_id: 1,
      amount: 10,
      type: 'income',
      category: 'Salary',
      description: null,
      date: new Date(),
      currency: 'USD',
      deleted_at: null,
    });

    expect(result.id).toBe(1);
    expect(mockedQuery.mock.calls[0][0]).toContain('INSERT INTO financial_records');
  });

  it('finds a record by id excluding deleted records', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 8 }],
      rowCount: 1,
    } as never);

    const result = await FinancialRecord.findById(8);

    expect(result).toEqual({ id: 8 });
    expect(mockedQuery.mock.calls[0][0]).toContain('deleted_at IS NULL');
  });

  it('counts filtered records', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ count: '4' }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [{ count: '10' }], rowCount: 1 } as never);

    const countByUser = await FinancialRecord.countByUserId(3, { query: 'rent' });
    const countAll = await FinancialRecord.countAll({ type: 'income' });

    expect(countByUser).toBe(4);
    expect(countAll).toBe(10);
  });

  it('throws when soft delete does not find a record', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(FinancialRecord.delete(99)).rejects.toBeInstanceOf(AppError);
  });

  it('throws when update receives no valid fields', async () => {
    await expect(FinancialRecord.update(1, {})).rejects.toBeInstanceOf(AppError);
  });

  it('updates a record', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 6, category: 'Updated' }],
      rowCount: 1,
    } as never);

    const result = await FinancialRecord.update(6, { category: 'Updated' });

    expect(result).toEqual({ id: 6, category: 'Updated' });
  });

  it('throws when update does not find a record', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(FinancialRecord.update(6, { category: 'Updated' })).rejects.toBeInstanceOf(AppError);
  });

  it('returns user summary rows', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ type: 'income', count: '2', total: '250.00' }],
      rowCount: 1,
    } as never);

    const result = await FinancialRecord.getUserSummary(1);

    expect(result).toEqual([{ type: 'income', count: '2', total: '250.00' }]);
    expect(mockedQuery.mock.calls[0][0]).toContain('deleted_at IS NULL');
  });
});
