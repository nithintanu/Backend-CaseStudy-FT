import User from '../models/User';
import { AppError } from '../errors/AppError';
import type { AuthUser, Role, SafeUser, UserStatus } from '../types/domain';

class UserService {
  static async getAllUsers(): Promise<SafeUser[]> {
    return User.findAll();
  }

  static async getUserById(requestedUserId: number, requester: AuthUser): Promise<SafeUser> {
    const user = await User.findById(requestedUserId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isSelf = requester.id === requestedUserId;
    if (requester.role !== 'admin' && !isSelf) {
      throw new AppError('Permission denied', 403, 'PERMISSION_DENIED');
    }

    return user;
  }

  static async updateUser(
    userId: number,
    updates: Partial<Pick<SafeUser, 'username' | 'email' | 'role' | 'status'>>,
  ): Promise<SafeUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return User.update(userId, updates);
  }

  static async deleteUser(userId: number): Promise<{ id: number }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return User.delete(userId);
  }

  static async assignRole(userId: number, role: Role): Promise<SafeUser> {
    return this.updateUser(userId, { role });
  }

  static async changeStatus(userId: number, status: UserStatus): Promise<SafeUser> {
    return this.updateUser(userId, { status });
  }
}

export default UserService;
