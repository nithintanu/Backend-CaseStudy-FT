#!/usr/bin/env node
import { closeDatabase } from '../src/config/database';
import { initializeDatabase } from '../database/init';

void initializeDatabase()
  .then(async () => {
    console.log('Database schema initialized successfully');
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error initializing database schema:', error);
    await closeDatabase();
    process.exit(1);
  });
