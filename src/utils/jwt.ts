import jwt from 'jsonwebtoken';
import config from '../config';
import type { AuthUser, UserRow } from '../types/domain';

export const generateToken = (user: Pick<UserRow, 'id' | 'username' | 'role'>): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiry as jwt.SignOptions['expiresIn'],
    },
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthUser;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): AuthUser | null => {
  return jwt.decode(token) as AuthUser | null;
};
