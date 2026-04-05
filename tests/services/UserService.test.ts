import UserService from '../../src/services/UserService';
import User from '../../src/models/User';
import { AppError } from '../../src/errors/AppError';

jest.mock('../../src/models/User');

const mockedUser = User as jest.Mocked<typeof User>;

describe('UserService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows a user to read their own profile', async () => {
    mockedUser.findById.mockResolvedValue({
      id: 7,
      username: 'self',
      email: 'self@example.com',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });

    const result = await UserService.getUserById(7, {
      id: 7,
      username: 'self',
      role: 'viewer',
    });

    expect(result.id).toBe(7);
  });

  it('blocks a non-admin from reading another profile', async () => {
    mockedUser.findById.mockResolvedValue({
      id: 7,
      username: 'other',
      email: 'other@example.com',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });

    await expect(
      UserService.getUserById(7, {
        id: 8,
        username: 'viewer',
        role: 'viewer',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('updates a user when the target exists', async () => {
    mockedUser.findById.mockResolvedValue({
      id: 5,
      username: 'target',
      email: 'target@example.com',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });
    mockedUser.update.mockResolvedValue({
      id: 5,
      username: 'target',
      email: 'updated@example.com',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });

    const result = await UserService.updateUser(5, { email: 'updated@example.com' });

    expect(result.email).toBe('updated@example.com');
  });

  it('throws when updating a missing user', async () => {
    mockedUser.findById.mockResolvedValue(undefined);

    await expect(UserService.updateUser(99, { email: 'missing@example.com' })).rejects.toBeInstanceOf(AppError);
  });

  it('throws when deleting a missing user', async () => {
    mockedUser.findById.mockResolvedValue(undefined);

    await expect(UserService.deleteUser(99)).rejects.toBeInstanceOf(AppError);
  });
});
