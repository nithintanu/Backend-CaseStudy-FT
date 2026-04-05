import FinancialRecord from '../models/FinancialRecord';
import { AppError } from '../errors/AppError';
import type { AuthUser, FinancialRecordRow, PaginatedResponse, RecordFilters, RecordType } from '../types/domain';

interface RecordPayload {
  amount: number;
  type: RecordType;
  category: string;
  description?: string | null;
  date?: string | Date;
  currency?: string;
}

class RecordService {
  private static normalizeFilters(filters: RecordFilters = {}): Required<Pick<RecordFilters, 'page' | 'limit'>> & RecordFilters {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError('Page must be a positive integer', 400, 'INVALID_PAGE');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError('Limit must be an integer between 1 and 100', 400, 'INVALID_LIMIT');
    }

    return {
      ...filters,
      page,
      limit,
      query: filters.query?.trim() || undefined,
    };
  }

  static async createRecord(userId: number, recordData: RecordPayload): Promise<FinancialRecordRow> {
    if (recordData.amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400, 'INVALID_AMOUNT');
    }

    return FinancialRecord.create({
      user_id: userId,
      amount: recordData.amount,
      type: recordData.type,
      category: recordData.category,
      description: recordData.description ?? null,
      date: recordData.date ? new Date(recordData.date) : new Date(),
      currency: recordData.currency ?? 'USD',
    });
  }

  static async getRecordById(recordId: number, user?: AuthUser): Promise<FinancialRecordRow> {
    const record = await FinancialRecord.findById(recordId);
    if (!record) {
      throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
    }

    if (user && user.role !== 'admin' && user.id !== record.user_id) {
      throw new AppError('Permission denied', 403, 'PERMISSION_DENIED');
    }

    return record;
  }

  static async getUserRecords(userId: number, filters: RecordFilters = {}): Promise<PaginatedResponse<FinancialRecordRow>> {
    const normalizedFilters = this.normalizeFilters(filters);
    const [data, total] = await Promise.all([
      FinancialRecord.findByUserId(userId, normalizedFilters),
      FinancialRecord.countByUserId(userId, normalizedFilters),
    ]);

    return {
      data,
      meta: {
        page: normalizedFilters.page,
        limit: normalizedFilters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / normalizedFilters.limit)),
      },
    };
  }

  static async getAllRecords(filters: RecordFilters = {}): Promise<PaginatedResponse<FinancialRecordRow>> {
    const normalizedFilters = this.normalizeFilters(filters);
    const [data, total] = await Promise.all([
      FinancialRecord.findAll(normalizedFilters),
      FinancialRecord.countAll(normalizedFilters),
    ]);

    return {
      data,
      meta: {
        page: normalizedFilters.page,
        limit: normalizedFilters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / normalizedFilters.limit)),
      },
    };
  }

  static async updateRecord(
    recordId: number,
    updates: Partial<Pick<FinancialRecordRow, 'amount' | 'type' | 'category' | 'description' | 'date' | 'currency'>>,
    user: AuthUser,
  ): Promise<FinancialRecordRow> {
    const record = await this.getRecordById(recordId, user);
    const canUpdateAny = user.role === 'admin';
    const canUpdateOwn = user.role === 'analyst' && user.id === record.user_id;

    if (!canUpdateAny && !canUpdateOwn) {
      throw new AppError('Permission denied', 403, 'PERMISSION_DENIED');
    }

    return FinancialRecord.update(recordId, updates);
  }

  static async getUserRecordSummary(userId: number) {
    return FinancialRecord.getUserSummary(userId);
  }

  static async deleteRecord(recordId: number, user: AuthUser): Promise<{ id: number }> {
    const record = await this.getRecordById(recordId, user);
    const canDeleteAny = user.role === 'admin';
    const canDeleteOwn = user.role === 'analyst' && user.id === record.user_id;

    if (!canDeleteAny && !canDeleteOwn) {
      throw new AppError('Permission denied', 403, 'PERMISSION_DENIED');
    }

    return FinancialRecord.delete(recordId);
  }
}

export default RecordService;
