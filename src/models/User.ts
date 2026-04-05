import { query } from '../config/database';
import { AppError } from '../errors/AppError';
import type { SafeUser, UserRow } from '../types/domain';

const USER_COLUMNS = 'id, username, email, role, status, created_at';

class User {
  static async create(userData: {
    username: string;
    email: string;
    password_hash: string;
    role: UserRow['role'];
    status?: UserRow['status'];
  }): Promise<SafeUser> {
    const result = await query<SafeUser>(
      `INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING ${USER_COLUMNS}`,
      [
        userData.username,
        userData.email,
        userData.password_hash,
        userData.role,
        userData.status ?? 'active',
      ],
    );

    return result.rows[0];
  }

  static async findById(userId: number): Promise<SafeUser | undefined> {
    const result = await query<SafeUser>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [userId],
    );

    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<UserRow | undefined> {
    const result = await query<UserRow>('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<SafeUser | undefined> {
    const result = await query<SafeUser>(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1`, [email]);
    return result.rows[0];
  }

  static async findAll(): Promise<SafeUser[]> {
    const result = await query<SafeUser>(`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC`);
    return result.rows;
  }

  static async update(
    userId: number,
    updates: Partial<Pick<SafeUser, 'username' | 'email' | 'role' | 'status'>>,
  ): Promise<SafeUser> {
    const allowedUpdates = ['username', 'email', 'role', 'status'] as const;
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

    updateValues.push(userId);

    const result = await query<SafeUser>(
      `UPDATE users
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${updateValues.length}
       RETURNING ${USER_COLUMNS}`,
      updateValues,
    );

    if (!result.rows[0]) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async delete(userId: number): Promise<{ id: number }> {
    const result = await query<{ id: number }>('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    if (!result.rows[0]) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return result.rows[0];
  }
}

export default User;
