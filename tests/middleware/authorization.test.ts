import type { NextFunction, Request, Response } from 'express';
import { requireAnyPermission, requirePermission, requireRole } from '../../src/middleware/authorization';

const createResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

describe('authorization middleware', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no user is present', () => {
    const req = {} as Request;
    const res = createResponse();

    requirePermission('read_record')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a user with the required permission', () => {
    const req = { user: { role: 'admin' } } as unknown as Request;
    const res = createResponse();

    requirePermission('delete_record')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('blocks a user without any of the required permissions', () => {
    const req = { user: { role: 'viewer' } } as unknown as Request;
    const res = createResponse();

    requireAnyPermission(['update_record', 'update_own_record'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('enforces allowed roles', () => {
    const req = { user: { role: 'analyst' } } as unknown as Request;
    const res = createResponse();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('blocks viewers from record reads under the current role model', () => {
    const req = { user: { role: 'viewer' } } as unknown as Request;
    const res = createResponse();

    requirePermission('read_record')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
