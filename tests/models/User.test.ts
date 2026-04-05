jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

import User from '../../src/models/User';
import { query } from '../../src/config/database';
import { AppError } from '../../src/errors/AppError';

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe('User model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns rows from findAll', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          created_at: new Date(),
        },
      ],
      rowCount: 1,
    } as never);

    const result = await User.findAll();

    expect(result).toHaveLength(1);
    expect(mockedQuery).toHaveBeenCalled();
  });

  it('creates a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 2, username: 'newuser' }],
      rowCount: 1,
    } as never);

    const result = await User.create({
      username: 'newuser',
      email: 'new@example.com',
      password_hash: 'hash',
      role: 'viewer',
    });

    expect(result).toEqual({ id: 2, username: 'newuser' });
  });

  it('finds user by id', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 3, username: 'viewer' }],
      rowCount: 1,
    } as never);

    const result = await User.findById(3);

    expect(result).toEqual({ id: 3, username: 'viewer' });
  });

  it('finds user by username', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 4, username: 'analyst' }],
      rowCount: 1,
    } as never);

    const result = await User.findByUsername('analyst');

    expect(result).toEqual({ id: 4, username: 'analyst' });
  });

  it('finds user by email', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 5, email: 'user@example.com' }],
      rowCount: 1,
    } as never);

    const result = await User.findByEmail('user@example.com');

    expect(result).toEqual({ id: 5, email: 'user@example.com' });
  });

  it('throws when update has no valid fields', async () => {
    await expect(User.update(1, {})).rejects.toBeInstanceOf(AppError);
  });

  it('updates a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 6, email: 'updated@example.com' }],
      rowCount: 1,
    } as never);

    const result = await User.update(6, { email: 'updated@example.com' });

    expect(result).toEqual({ id: 6, email: 'updated@example.com' });
  });

  it('throws when update does not find a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(User.update(6, { email: 'updated@example.com' })).rejects.toBeInstanceOf(AppError);
  });

  it('throws when delete does not find a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as never);

    await expect(User.delete(77)).rejects.toBeInstanceOf(AppError);
  });

  it('deletes a user', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 77 }],
      rowCount: 1,
    } as never);

    const result = await User.delete(77);

    expect(result).toEqual({ id: 77 });
  });
});
