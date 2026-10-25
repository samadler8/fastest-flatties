-- Private write-only-from-server archive; synchronized to the repository via GitHub Actions.
CREATE TABLE IF NOT EXISTS public.strava_activity_archives (
  activity_id TEXT PRIMARY KEY CHECK (activity_id ~ '^[0-9]+$'),
  athlete_name TEXT NOT NULL CHECK (length(trim(athlete_name)) > 0),
  activity_title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  original_point_count INTEGER NOT NULL CHECK (original_point_count >= 2),
  retained_point_count INTEGER NOT NULL CHECK (retained_point_count >= 2),
  sparse_gpx TEXT NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.strava_activity_archives ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: only the service role can read/write.
