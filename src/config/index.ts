import dotenv from 'dotenv';
import { AppError } from '../errors/AppError';

dotenv.config();

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('Invalid PORT configuration', 500, 'INVALID_PORT');
  }
  return parsed;
};

const requireString = (value: string | undefined, fallback: string, field: string): string => {
  const resolved = value?.trim() || fallback;
  if (!resolved) {
    throw new AppError(`Missing required configuration: ${field}`, 500, 'CONFIGURATION_ERROR');
  }
  return resolved;
};

const port = parsePort(process.env.PORT, 5000);

const config = {
  env: process.env.NODE_ENV?.trim() || 'development',
  port,
  database: {
    host: requireString(process.env.DB_HOST, 'localhost', 'DB_HOST'),
    port: parsePort(process.env.DB_PORT, 5432),
    database: requireString(process.env.DB_NAME, 'finance_db', 'DB_NAME'),
    user: requireString(process.env.DB_USER, 'postgres', 'DB_USER'),
    password: requireString(process.env.DB_PASSWORD, 'postgres', 'DB_PASSWORD'),
  },
  jwt: {
    secret: requireString(process.env.JWT_SECRET, 'dev_secret_key', 'JWT_SECRET'),
    expiry: requireString(process.env.JWT_EXPIRY, '7d', 'JWT_EXPIRY'),
  },
  api: {
    baseUrl: process.env.API_BASE_URL?.trim() || `http://localhost:${port}`,
  },
} as const;

export default config;
