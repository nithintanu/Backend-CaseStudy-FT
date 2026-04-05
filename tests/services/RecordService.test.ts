import RecordService from '../../src/services/RecordService';
import FinancialRecord from '../../src/models/FinancialRecord';
import { AppError } from '../../src/errors/AppError';

jest.mock('../../src/models/FinancialRecord');

const mockedFinancialRecord = FinancialRecord as jest.Mocked<typeof FinancialRecord>;

describe('RecordService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows an admin to delete any record', async () => {
    mockedFinancialRecord.findById.mockResolvedValue({
      id: 10,
      user_id: 3,
      amount: 100,
      type: 'income',
      category: 'Salary',
      description: null,
      date: new Date(),
      currency: 'USD',
      created_at: new Date(),
    });
    mockedFinancialRecord.delete.mockResolvedValue({ id: 10 });

    const result = await RecordService.deleteRecord(10, {
      id: 1,
      username: 'admin',
      role: 'admin',
    });

    expect(result).toEqual({ id: 10 });
  });

  it('blocks a viewer from deleting a record', async () => {
    mockedFinancialRecord.findById.mockResolvedValue({
      id: 10,
      user_id: 3,
      amount: 100,
      type: 'income',
      category: 'Salary',
      description: null,
      date: new Date(),
      currency: 'USD',
      created_at: new Date(),
    });

    await expect(
      RecordService.deleteRecord(10, {
        id: 2,
        username: 'viewer',
        role: 'viewer',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('returns paginated records metadata for listing', async () => {
    mockedFinancialRecord.findByUserId.mockResolvedValue([
      {
        id: 11,
        user_id: 3,
        amount: 250,
        type: 'expense',
        category: 'Food',
        description: 'Lunch',
        date: new Date(),
        currency: 'USD',
        created_at: new Date(),
      },
    ]);
    mockedFinancialRecord.countByUserId.mockResolvedValue(21);

    const result = await RecordService.getUserRecords(3, { page: 2, limit: 10, query: 'foo' });

    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
    });
    expect(result.data).toHaveLength(1);
  });

  it('rejects invalid pagination input', async () => {
    await expect(RecordService.getUserRecords(3, { page: 0, limit: 10 })).rejects.toBeInstanceOf(AppError);
    await expect(RecordService.getAllRecords({ page: 1, limit: 101 })).rejects.toBeInstanceOf(AppError);
  });
});
