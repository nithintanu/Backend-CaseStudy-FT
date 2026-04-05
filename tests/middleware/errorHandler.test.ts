import type { NextFunction, Request, Response } from 'express';
import errorHandler, { notFoundHandler } from '../../src/middleware/errorHandler';
import { AppError } from '../../src/errors/AppError';

const createResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

describe('errorHandler', () => {
  const req = {} as Request;
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats AppError instances', () => {
    const res = createResponse();
    const error = new AppError('Forbidden', 403, 'PERMISSION_DENIED', { action: 'delete' });

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      code: 'PERMISSION_DENIED',
      details: { action: 'delete' },
    });
  });

  it('formats unknown Error instances as 500', () => {
    const res = createResponse();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('Boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Boom',
      code: 'INTERNAL_SERVER_ERROR',
    });

    spy.mockRestore();
  });

  it('returns generic 500 for non-Error values', () => {
    const res = createResponse();

    errorHandler('bad' as unknown, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('returns 404 from notFoundHandler', () => {
    const res = createResponse();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
    });
  });
});
