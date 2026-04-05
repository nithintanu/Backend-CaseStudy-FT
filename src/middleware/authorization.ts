import type { NextFunction, Request, Response } from 'express';
import { hasAnyPermission, hasPermission } from '../utils/permissions';
import type { Role } from '../types/domain';

const ensureUser = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return false;
  }

  return true;
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!ensureUser(req, res)) {
      return;
    }

    if (!hasPermission(req.user!.role, permission)) {
      res.status(403).json({
        error: `Permission denied. Required permission: ${permission}`,
      });
      return;
    }

    next();
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!ensureUser(req, res)) {
      return;
    }

    if (!hasAnyPermission(req.user!.role, permissions)) {
      res.status(403).json({
        error: `Permission denied. Required one of: ${permissions.join(', ')}`,
      });
      return;
    }

    next();
  };
};

export const requireRole = (roles: Role | Role[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!ensureUser(req, res)) {
      return;
    }

    if (!allowedRoles.includes(req.user!.role)) {
      res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
