-- Enable RLS on exposed tables to block unauthorized public API access
ALTER TABLE public.athlete_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_test ENABLE ROW LEVEL SECURITY;