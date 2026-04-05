CREATE INDEX IF NOT EXISTS idx_records_user_id ON financial_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);
CREATE INDEX IF NOT EXISTS idx_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
