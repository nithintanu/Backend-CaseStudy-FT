export type Role = 'admin' | 'analyst' | 'viewer';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type RecordType = 'income' | 'expense';

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  email?: string;
  status?: UserStatus;
}

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  role: Role;
  status: UserStatus;
  created_at: Date;
  updated_at?: Date;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: Date;
}

export interface FinancialRecordRow {
  id: number;
  user_id: number;
  amount: number;
  type: RecordType;
  category: string;
  description: string | null;
  date: Date;
  currency: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface RecordFilters {
  userId?: number;
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface UserSummaryRow {
  type: RecordType;
  count: string;
  total: string;
}

export interface CategoryTotalRow {
  category: string;
  type: RecordType;
  total: string;
}

export interface MonthlyTrendRow {
  month: string;
  type: RecordType;
  total: string;
}

export interface AdminDashboardRow {
  id: number;
  username: string;
  email: string;
  role: Role;
  record_count: string;
  total_income: string;
  total_expenses: string;
}
