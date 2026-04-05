import AuthService from '../../src/services/AuthService';
import User from '../../src/models/User';
import * as passwordUtils from '../../src/utils/password';
import * as jwtUtils from '../../src/utils/jwt';
import { AppError } from '../../src/errors/AppError';

jest.mock('../../src/models/User');
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/jwt');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;
const mockedJwtUtils = jwtUtils as jest.Mocked<typeof jwtUtils>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('registers a new user and returns a token', async () => {
    mockedUser.findByUsername.mockResolvedValue(undefined);
    mockedUser.findByEmail.mockResolvedValue(undefined);
    mockedPasswordUtils.hashPassword.mockResolvedValue('hashed-password');
    mockedUser.create.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });
    mockedJwtUtils.generateToken.mockReturnValue('signed-token');

    const result = await AuthService.register({
      username: 'alice',
      email: 'alice@example.com',
      password: 'CaseStudy123',
    });

    expect(result.token).toBe('signed-token');
    expect(result.user.username).toBe('alice');
  });

  it('rejects duplicate usernames', async () => {
    mockedUser.findByUsername.mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password_hash: 'hash',
      role: 'viewer',
      status: 'active',
      created_at: new Date(),
    });
    mockedUser.findByEmail.mockResolvedValue(undefined);

    await expect(
      AuthService.register({
        username: 'alice',
        email: 'other@example.com',
        password: 'CaseStudy123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
