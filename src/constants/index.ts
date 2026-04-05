import type { RecordType, Role, UserStatus } from '../types/domain';

export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const;

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  analyst: 2,
  viewer: 1,
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'create_record',
    'read_record',
    'update_record',
    'delete_record',
    'create_user',
    'update_user',
    'delete_user',
    'assign_role',
    'view_analytics',
  ],
  analyst: [
    'read_record',
    'create_record',
    'update_own_record',
    'delete_own_record',
    'view_analytics',
  ],
  viewer: ['view_analytics'],
};

export const RECORD_TYPES: Record<Uppercase<RecordType>, RecordType> = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const USER_STATUS: Record<Uppercase<UserStatus>, UserStatus> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};
