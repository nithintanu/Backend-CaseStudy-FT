import { ROLE_PERMISSIONS } from '../constants';
import type { Role } from '../types/domain';

export const hasPermission = (userRole: Role, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const hasAnyPermission = (userRole: Role, permissions: string[]): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: Role, permissions: string[]): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};
