import { promises as fs } from 'fs';
import path from 'path';
import { closeDatabase, getClient } from '../src/config/database';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'database', 'migrations');

const ensureMigrationsTable = async () => {
  const client = await getClient();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
};

export const runMigrations = async (): Promise<void> => {
  await ensureMigrationsTable();

  const client = await getClient();
  let inTransaction = false;
  try {
    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const alreadyRun = await client.query<{ name: string }>(
        'SELECT name FROM schema_migrations WHERE name = $1',
        [file],
      );

      if (alreadyRun.rows.length > 0) {
        continue;
      }

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      inTransaction = true;
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      inTransaction = false;

      console.log(`Applied migration: ${file}`);
    }
  } catch (error) {
    if (inTransaction) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  void runMigrations()
    .then(async () => {
      console.log('Migrations completed successfully');
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Migration failed:', error);
      await closeDatabase();
      process.exit(1);
    });
}
