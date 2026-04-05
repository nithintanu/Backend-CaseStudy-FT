import { getClient, query } from '../src/config/database';
import { runMigrations } from '../scripts/migrate';
const ENSURE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    run_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

let initializationPromise: Promise<void> | null = null;

export const initializeDatabase = async (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const client = await getClient();

    try {
      await client.query(ENSURE_MIGRATIONS_TABLE);
      await runMigrations();
    } catch (error) {
      initializationPromise = null;
      throw error;
    } finally {
      client.release();
    }
  })();

  return initializationPromise;
};

export const checkDatabaseConnection = async (): Promise<void> => {
  await query('SELECT 1');
};
