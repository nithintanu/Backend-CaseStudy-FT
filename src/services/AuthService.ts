import User from '../models/User';
import { AppError } from '../errors/AppError';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

class AuthService {
  static async register({ username, email, password }: RegisterInput) {
    const [existingUser, existingEmail] = await Promise.all([
      User.findByUsername(username),
      User.findByEmail(email),
    ]);

    if (existingUser) {
      throw new AppError('Username already exists', 409, 'USERNAME_TAKEN');
    }

    if (existingEmail) {
      throw new AppError('Email already exists', 409, 'EMAIL_TAKEN');
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password_hash: passwordHash,
      role: 'viewer',
      status: 'active',
    });

    return {
      user,
      token: generateToken(user),
    };
  }

  static async login({ username, password }: LoginInput) {
    const user = await User.findByUsername(username);

    if (!user) {
      throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash ?? '');

    if (!isPasswordValid) {
      throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      throw new AppError('User account is not active', 403, 'USER_NOT_ACTIVE');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
      token: generateToken(user),
    };
  }
}

export default AuthService;
