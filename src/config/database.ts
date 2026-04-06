import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import config from './index';

const ssl =
  process.env.DB_SSL?.trim().toLowerCase() === 'true'
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl,
});

pool.on('error', (error) => {
  console.error('Unexpected database error on idle client', error);
});

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  const startedAt = Date.now();
  const result = await pool.query<T>(text, params);

  if (config.env !== 'test') {
    const duration = Date.now() - startedAt;
    console.log('Executed query', { duration, rows: result.rowCount });
  }

  return result;
};

export const getClient = async (): Promise<PoolClient> => pool.connect();

export const checkDatabaseConnection = async (): Promise<void> => {
  await query('SELECT 1');
};

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};

export { pool };
