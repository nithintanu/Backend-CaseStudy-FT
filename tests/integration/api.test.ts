import request from 'supertest';
import type { AuthUser } from '../../src/types/domain';

jest.mock('../../src/services/AuthService', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

jest.mock('../../src/services/RecordService', () => ({
  __esModule: true,
  default: {
    createRecord: jest.fn(),
    getRecordById: jest.fn(),
    getUserRecords: jest.fn(),
    getAllRecords: jest.fn(),
    updateRecord: jest.fn(),
    getUserRecordSummary: jest.fn(),
    deleteRecord: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
  decodeToken: jest.fn(),
}));

jest.mock('../../src/config/database', () => ({
  checkDatabaseConnection: jest.fn().mockResolvedValue(undefined),
}));

import app from '../../src/app';
import AuthService from '../../src/services/AuthService';
import RecordService from '../../src/services/RecordService';
import { verifyToken } from '../../src/utils/jwt';

const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockedRecordService = RecordService as jest.Mocked<typeof RecordService>;
const mockedVerifyToken = verifyToken as jest.Mock;

const authUser: AuthUser = {
  id: 1,
  username: 'admin',
  role: 'admin',
};

describe('API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('logs in through the auth route', async () => {
    mockedAuthService.login.mockResolvedValue({
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
      },
      token: 'token-123',
    });

    const response = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('token-123');
    expect(mockedAuthService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
    });
  });

  it('rejects protected auth route access without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No authorization header');
  });

  it('returns the authenticated user profile with a valid token', async () => {
    mockedVerifyToken.mockReturnValue(authUser);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe('admin');
  });

  it('returns paginated records through the records route', async () => {
    mockedVerifyToken.mockReturnValue(authUser);
    mockedRecordService.getUserRecords.mockResolvedValue({
      data: [
        {
          id: 11,
          user_id: 1,
          amount: 120,
          type: 'expense',
          category: 'Food',
          description: 'Lunch',
          date: new Date('2026-04-01T10:00:00.000Z'),
          currency: 'USD',
          created_at: new Date('2026-04-01T10:00:00.000Z'),
          deleted_at: null,
        },
      ],
      meta: {
        page: 2,
        limit: 5,
        total: 11,
        totalPages: 3,
      },
    });

    const response = await request(app)
      .get('/api/records?page=2&limit=5&query=food')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 5,
      total: 11,
      totalPages: 3,
    });
    expect(mockedRecordService.getUserRecords).toHaveBeenCalledWith(1, {
      type: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
      query: 'food',
      page: 2,
      limit: 5,
    });
  });

  it('soft-deletes a record through the records route', async () => {
    mockedVerifyToken.mockReturnValue(authUser);
    mockedRecordService.deleteRecord.mockResolvedValue({ id: 22 });

    const response = await request(app)
      .delete('/api/records/22')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(204);
    expect(mockedRecordService.deleteRecord).toHaveBeenCalledWith(22, authUser);
  });
});
