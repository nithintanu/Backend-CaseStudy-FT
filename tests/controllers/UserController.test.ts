jest.mock('../../src/services/UserService', () => ({
  __esModule: true,
  default: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    assignRole: jest.fn(),
    changeStatus: jest.fn(),
  },
}));

import type { NextFunction, Request, Response } from 'express';
import UserController from '../../src/controllers/UserController';
import UserService from '../../src/services/UserService';

const mockedUserService = UserService as jest.Mocked<typeof UserService>;

const createResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;

  return res;
};

describe('UserController', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all users', async () => {
    const req = {} as Request;
    const res = createResponse();
    mockedUserService.getAllUsers.mockResolvedValue([]);

    await UserController.getAllUsers(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('assigns a role', async () => {
    const req = {
      params: { id: '9' },
      validatedData: { role: 'analyst' },
    } as unknown as Request;
    const res = createResponse();
    mockedUserService.assignRole.mockResolvedValue({
      id: 9,
      username: 'user',
      email: 'user@example.com',
      role: 'analyst',
      status: 'active',
      created_at: new Date(),
    });

    await UserController.assignRole(req, res, next);

    expect(mockedUserService.assignRole).toHaveBeenCalledWith(9, 'analyst');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deletes a user', async () => {
    const req = { params: { id: '4' } } as unknown as Request;
    const res = createResponse();
    mockedUserService.deleteUser.mockResolvedValue({ id: 4 });

    await UserController.deleteUser(req, res, next);

    expect(mockedUserService.deleteUser).toHaveBeenCalledWith(4);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
