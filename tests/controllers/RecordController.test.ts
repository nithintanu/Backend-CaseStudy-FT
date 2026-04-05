jest.mock('../../src/services/RecordService', () => ({
  __esModule: true,
  default: {
    createRecord: jest.fn(),
    getRecordById: jest.fn(),
    getUserRecords: jest.fn(),
    getAllRecords: jest.fn(),
    updateRecord: jest.fn(),
    getUserRecordSummary: jest.fn(),
    deleteRecord: jest.fn(),
  },
}));

import type { NextFunction, Request, Response } from 'express';
import RecordController from '../../src/controllers/RecordController';
import RecordService from '../../src/services/RecordService';

const mockedRecordService = RecordService as jest.Mocked<typeof RecordService>;

const createResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

describe('RecordController', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses record filters from query params', () => {
    const req = {
      query: {
        type: 'expense',
        category: 'Food',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        query: 'lunch',
        page: '2',
        limit: '5',
      },
    } as unknown as Request;

    expect(RecordController.parseRecordFilters(req)).toEqual({
      type: 'expense',
      category: 'Food',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      query: 'lunch',
      page: 2,
      limit: 5,
    });
  });

  it('returns user records', async () => {
    const req = {
      user: { id: 1 },
      query: { page: '1', limit: '10' },
    } as unknown as Request;
    const res = createResponse();
    mockedRecordService.getUserRecords.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    await RecordController.getUserRecords(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockedRecordService.getUserRecords).toHaveBeenCalledWith(1, {
      type: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('creates a record', async () => {
    const req = {
      user: { id: 1 },
      validatedData: {
        amount: 100,
        type: 'income',
        category: 'Salary',
      },
    } as unknown as Request;
    const res = createResponse();
    mockedRecordService.createRecord.mockResolvedValue({
      id: 1,
      user_id: 1,
      amount: 100,
      type: 'income',
      category: 'Salary',
      description: null,
      date: new Date(),
      currency: 'USD',
      created_at: new Date(),
      deleted_at: null,
    });

    await RecordController.createRecord(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('gets a record by id', async () => {
    const req = {
      user: { id: 1, role: 'admin' },
      params: { id: '7' },
    } as unknown as Request;
    const res = createResponse();
    mockedRecordService.getRecordById.mockResolvedValue({
      id: 7,
      user_id: 1,
      amount: 100,
      type: 'income',
      category: 'Salary',
      description: null,
      date: new Date(),
      currency: 'USD',
      created_at: new Date(),
      deleted_at: null,
    });

    await RecordController.getRecordById(req, res, next);

    expect(mockedRecordService.getRecordById).toHaveBeenCalledWith(7, req.user);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('gets all records for admin', async () => {
    const req = {
      query: { userId: '5', page: '3', limit: '2', query: 'rent' },
    } as unknown as Request;
    const res = createResponse();
    mockedRecordService.getAllRecords.mockResolvedValue({
      data: [],
      meta: { page: 3, limit: 2, total: 0, totalPages: 1 },
    });

    await RecordController.getAllRecords(req, res, next);

    expect(mockedRecordService.getAllRecords).toHaveBeenCalledWith({
      type: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      query: 'rent',
      page: 3,
      limit: 2,
      userId: 5,
    });
  });

  it('updates a record', async () => {
    const req = {
      user: { id: 1, role: 'admin' },
      params: { id: '9' },
      validatedData: { category: 'Updated' },
    } as unknown as Request;
    const res = createResponse();
    mockedRecordService.updateRecord.mockResolvedValue({
      id: 9,
      user_id: 1,
      amount: 100,
      type: 'income',
      category: 'Updated',
      description: null,
      date: new Date(),
      currency: 'USD',
      created_at: new Date(),
      deleted_at: null,
    });

    await RecordController.updateRecord(req, res, next);

    expect(mockedRecordService.updateRecord).toHaveBeenCalledWith(9, { category: 'Updated' }, req.user);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns record summary', async () => {
    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();
    mockedRecordService.getUserRecordSummary.mockResolvedValue([{ type: 'income', count: '1', total: '100.00' }]);

    await RecordController.getUserRecordSummary(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ type: 'income', count: '1', total: '100.00' }]);
  });

  it('deletes a record', async () => {
    const req = {
      user: { id: 1, role: 'admin' },
      params: { id: '12' },
    } as unknown as Request;
    const res = createResponse();

    mockedRecordService.deleteRecord.mockResolvedValue({ id: 12 });

    await RecordController.deleteRecord(req, res, next);

    expect(mockedRecordService.deleteRecord).toHaveBeenCalledWith(12, req.user);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
