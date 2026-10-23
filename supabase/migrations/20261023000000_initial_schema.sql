-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Athletes Table
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  instagram TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  distance_miles FLOAT,
  elevation_gain_ft INTEGER,
  gpx_url TEXT,
  start_finish TEXT,
  rules TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Efforts Table
CREATE TABLE IF NOT EXISTS efforts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  time_seconds INTEGER NOT NULL,
  formatted_time TEXT NOT NULL,
  activity_date DATE NOT NULL,
  gpx_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE efforts ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policies
CREATE POLICY "Allow public read access on routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on athletes" ON athletes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on efforts" ON efforts FOR SELECT USING (true);