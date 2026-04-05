import { query } from '../config/database';
import type { AdminDashboardRow, CategoryTotalRow, FinancialRecordRow, MonthlyTrendRow } from '../types/domain';

type CategoryTotal = Omit<CategoryTotalRow, 'total'> & { total: number };
type MonthlyTrend = Omit<MonthlyTrendRow, 'total'> & { total: number };
type AdminDashboardEntry = Omit<AdminDashboardRow, 'record_count' | 'total_income' | 'total_expenses'> & {
  record_count: number;
  total_income: number;
  total_expenses: number;
};

const parseNumeric = (value: string): number => Number.parseFloat(value);

class AnalyticsService {
  static async getTotalIncome(userId: number): Promise<number> {
    const result = await query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM financial_records
       WHERE user_id = $1 AND type = 'income' AND deleted_at IS NULL`,
      [userId],
    );

    return parseNumeric(result.rows[0].total);
  }

  static async getTotalExpenses(userId: number): Promise<number> {
    const result = await query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM financial_records
       WHERE user_id = $1 AND type = 'expense' AND deleted_at IS NULL`,
      [userId],
    );

    return parseNumeric(result.rows[0].total);
  }

  static async getNetBalance(userId: number): Promise<number> {
    const [income, expenses] = await Promise.all([
      this.getTotalIncome(userId),
      this.getTotalExpenses(userId),
    ]);

    return income - expenses;
  }

  static async getCategoryTotals(userId: number): Promise<CategoryTotal[]> {
    const result = await query<CategoryTotalRow>(
      `SELECT category, type, COALESCE(SUM(amount), 0) AS total
       FROM financial_records
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY category, type
       ORDER BY total DESC`,
      [userId],
    );

    return result.rows.map((row) => ({
      ...row,
      total: parseNumeric(row.total),
    }));
  }

  static async getRecentActivity(userId: number, limit = 10): Promise<FinancialRecordRow[]> {
    const result = await query<FinancialRecordRow>(
      `SELECT *
       FROM financial_records
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows;
  }

  static async getMonthlyTrends(userId: number): Promise<MonthlyTrend[]> {
    const result = await query<MonthlyTrendRow>(
      `SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, COALESCE(SUM(amount), 0) AS total
       FROM financial_records
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY month, type
       ORDER BY month DESC`,
      [userId],
    );

    return result.rows.map((row) => ({
      ...row,
      total: parseNumeric(row.total),
    }));
  }

  static async getDashboardSummary(userId: number) {
    const [totalIncome, totalExpenses, categoryTotals, recentActivity] = await Promise.all([
      this.getTotalIncome(userId),
      this.getTotalExpenses(userId),
      this.getCategoryTotals(userId),
      this.getRecentActivity(userId, 5),
    ]);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryTotals,
      recentActivity,
    };
  }

  static async getAdminDashboard(): Promise<AdminDashboardEntry[]> {
    const result = await query<AdminDashboardRow>(
      `SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        COUNT(fr.id) AS record_count,
        COALESCE(SUM(CASE WHEN fr.type = 'income' THEN fr.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN fr.type = 'expense' THEN fr.amount ELSE 0 END), 0) AS total_expenses
       FROM users u
       LEFT JOIN financial_records fr ON u.id = fr.user_id AND fr.deleted_at IS NULL
       GROUP BY u.id, u.username, u.email, u.role, u.created_at
       ORDER BY u.created_at DESC`,
    );

    return result.rows.map((row) => ({
      ...row,
      record_count: Number.parseInt(row.record_count, 10),
      total_income: parseNumeric(row.total_income),
      total_expenses: parseNumeric(row.total_expenses),
    }));
  }
}

export default AnalyticsService;
