-- Non-destructive table creation to verify automated GitHub deployment
CREATE TABLE IF NOT EXISTS migration_test (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'Pipeline Active',
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert a test ping entry
INSERT INTO migration_test (status) VALUES ('Pipeline Active');