import type { NextFunction, Request, Response } from 'express';
import { isAppError } from '../errors/AppError';

const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (isAppError(error)) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found', code: 'ROUTE_NOT_FOUND' });
};

export default errorHandler;
