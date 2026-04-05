import { query } from '../config/database';
import { AppError } from '../errors/AppError';
import type { FinancialRecordRow, RecordFilters, UserSummaryRow } from '../types/domain';

const buildFilteredRecordQuery = (filters: RecordFilters, scopedUserId?: number) => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  conditions.push('deleted_at IS NULL');

  if (scopedUserId !== undefined) {
    params.push(scopedUserId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (filters.userId !== undefined) {
    params.push(filters.userId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`type = $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }

  if (filters.startDate) {
    params.push(filters.startDate);
    conditions.push(`date >= $${params.length}`);
  }

  if (filters.endDate) {
    params.push(filters.endDate);
    conditions.push(`date <= $${params.length}`);
  }

  if (filters.query) {
    params.push(`%${filters.query}%`);
    conditions.push(`(category ILIKE $${params.length} OR COALESCE(description, '') ILIKE $${params.length})`);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

class FinancialRecord {
  static async create(recordData: Omit<FinancialRecordRow, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialRecordRow> {
    const result = await query<FinancialRecordRow>(
      `INSERT INTO financial_records (user_id, amount, type, category, description, date, currency, created_at, updated_at, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NULL)
       RETURNING *`,
      [
        recordData.user_id,
        recordData.amount,
        recordData.type,
        recordData.category,
        recordData.description,
        recordData.date,
        recordData.currency,
      ],
    );

    return result.rows[0];
  }

  static async findById(recordId: number): Promise<FinancialRecordRow | undefined> {
    const result = await query<FinancialRecordRow>(
      'SELECT * FROM financial_records WHERE id = $1 AND deleted_at IS NULL',
      [recordId],
    );
    return result.rows[0];
  }

  static async findByUserId(userId: number, filters: RecordFilters = {}): Promise<FinancialRecordRow[]> {
    const { whereClause, params } = buildFilteredRecordQuery(filters, userId);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    const result = await query<FinancialRecordRow>(
      `SELECT * FROM financial_records
       ${whereClause}
       ORDER BY date DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return result.rows;
  }

  static async findAll(filters: RecordFilters = {}): Promise<FinancialRecordRow[]> {
    const { whereClause, params } = buildFilteredRecordQuery(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    const result = await query<FinancialRecordRow>(
      `SELECT * FROM financial_records
       ${whereClause}
       ORDER BY date DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return result.rows;
  }

  static async countByUserId(userId: number, filters: RecordFilters = {}): Promise<number> {
    const { whereClause, params } = buildFilteredRecordQuery(filters, userId);
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM financial_records
       ${whereClause}`,
      params,
    );

    return Number.parseInt(result.rows[0].count, 10);
  }

  static async countAll(filters: RecordFilters = {}): Promise<number> {
    const { whereClause, params } = buildFilteredRecordQuery(filters);
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM financial_records
       ${whereClause}`,
      params,
    );

    return Number.parseInt(result.rows[0].count, 10);
  }

  static async update(
    recordId: number,
    updates: Partial<Pick<FinancialRecordRow, 'amount' | 'type' | 'category' | 'description' | 'date' | 'currency'>>,
  ): Promise<FinancialRecordRow> {
    const allowedUpdates = ['amount', 'type', 'category', 'description', 'date', 'currency'] as const;
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    allowedUpdates.forEach((key) => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new AppError('No valid fields to update', 400, 'NO_VALID_UPDATES');
    }

    updateValues.push(recordId);

    const result = await query<FinancialRecordRow>(
      `UPDATE financial_records
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${updateValues.length}
       RETURNING *`,
      updateValues,
    );

    if (!result.rows[0]) {
      throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async delete(recordId: number): Promise<{ id: number }> {
    const result = await query<{ id: number }>(
      `UPDATE financial_records
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [recordId],
    );

    if (!result.rows[0]) {
      throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async getUserSummary(userId: number): Promise<UserSummaryRow[]> {
    const result = await query<UserSummaryRow>(
      `SELECT type, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM financial_records
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY type`,
      [userId],
    );

    return result.rows;
  }
}

export default FinancialRecord;
