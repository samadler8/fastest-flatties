-- The initial schema already creates public.efforts for manual submissions.
-- Extend that table instead of trying to create a second incompatible efforts table.
-- Nullable columns preserve existing manual/COROS entries without a Strava ID.
ALTER TABLE public.efforts
  ADD COLUMN IF NOT EXISTS strava_activity_id BIGINT,
  ADD COLUMN IF NOT EXISTS elapsed_time_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS encoded_polyline TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS efforts_strava_activity_route_unique
  ON public.efforts (strava_activity_id, route_id)
  WHERE strava_activity_id IS NOT NULL;
