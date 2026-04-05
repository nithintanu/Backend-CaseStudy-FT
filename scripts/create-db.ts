#!/usr/bin/env node
import { Pool } from 'pg';
import config from '../src/config';

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: 'postgres',
  user: config.database.user,
  password: config.database.password,
});

const createDatabase = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log(`Ensuring database "${config.database.database}" exists...`);

    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      config.database.database,
    ]);

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE ${config.database.database}`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
  } finally {
    client.release();
    await pool.end();
  }
};

void createDatabase().catch((error) => {
  console.error('Error creating database:', error);
  process.exit(1);
});
