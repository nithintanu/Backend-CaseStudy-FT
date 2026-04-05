import type { Server } from 'http';
import app from './app';
import config from './config';
import { closeDatabase } from './config/database';
import { initializeDatabase } from '../database/init';

let server: Server | null = null;

export const startServer = async (): Promise<void> => {
  await initializeDatabase();

  server = app.listen(config.port, () => {
    console.log(`Zorvyn backend running on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
    console.log(`Base URL: ${config.api.baseUrl}`);
  });
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  console.log(`Received ${signal}, shutting down.`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Graceful shutdown failed', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  void startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

export default app;
