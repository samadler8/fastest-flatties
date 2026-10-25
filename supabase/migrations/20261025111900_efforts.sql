CREATE TABLE efforts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strava_activity_id BIGINT NOT NULL,
  route_id UUID REFERENCES routes(id) NOT NULL,
  elapsed_time_seconds INTEGER NOT NULL,
  encoded_polyline TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries for the same activity on the same route
  UNIQUE(strava_activity_id, route_id)
);