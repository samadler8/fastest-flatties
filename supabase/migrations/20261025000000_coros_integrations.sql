-- Store athlete API tokens securely
CREATE TABLE IF NOT EXISTS athlete_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('coros', 'strava', 'garmin')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  coros_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_athlete_provider UNIQUE (athlete_id, provider)
);

-- Add source column to efforts to trace origins
ALTER TABLE efforts 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Manual Submission' CHECK (source IN ('Manual Submission', 'Strava', 'COROS'));