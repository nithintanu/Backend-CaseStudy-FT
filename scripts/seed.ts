import { initializeDatabase } from '../database/init';
import { query, closeDatabase } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seed...');
    await initializeDatabase();

    const adminPasswordHash = await hashPassword('admin123');
    await query(
      `INSERT INTO users (username, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', 'admin@finance.local', adminPasswordHash, 'admin', 'active'],
    );
    console.log('Admin user ensured');

    const analystPasswordHash = await hashPassword('analyst123');
    await query(
      `INSERT INTO users (username, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      ['analyst', 'analyst@finance.local', analystPasswordHash, 'analyst', 'active'],
    );
    console.log('Analyst user ensured');

    const viewerPasswordHash = await hashPassword('viewer123');
    await query(
      `INSERT INTO users (username, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      ['viewer', 'viewer@finance.local', viewerPasswordHash, 'viewer', 'active'],
    );
    console.log('Viewer user ensured');

    const analyst = await query<{ id: number }>('SELECT id FROM users WHERE username = $1', ['analyst']);
    const analystId = analyst.rows[0]?.id;

    if (analystId) {
      const sampleRecords: Array<[number, number, 'income' | 'expense', string, string, string]> = [
        [analystId, 5000, 'income', 'Salary', 'Monthly salary', '2024-01-01'],
        [analystId, 1500, 'expense', 'Rent', 'Apartment rent', '2024-01-05'],
        [analystId, 300, 'expense', 'Food', 'Groceries and dining', '2024-01-10'],
        [analystId, 2000, 'income', 'Freelance', 'Project work', '2024-01-15'],
        [analystId, 200, 'expense', 'Transport', 'Gas and transit', '2024-01-20'],
      ];

      for (const record of sampleRecords) {
        await query(
          `INSERT INTO financial_records (user_id, amount, type, category, description, date)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          record,
        );
      }
    }

    console.log('Sample records ensured');
  } finally {
    await closeDatabase();
  }
};

void seedDatabase()
  .then(() => {
    console.log('Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
