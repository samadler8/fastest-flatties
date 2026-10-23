-- Insert Initial Athletes
INSERT INTO athletes (id, name, instagram)
VALUES ('a1111111-1111-1111-1111-111111111111', 'Kyle Richardson', '@kylerichardson')
ON CONFLICT (id) DO NOTHING;

-- Insert First Flatiron DEF Route
INSERT INTO routes (id, name, description, distance_miles, elevation_gain_ft, gpx_url, start_finish, rules, photos)
VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'First Flatiron - Direct East Face (DEF)',
  'The iconic Direct East Face scramble from Chautauqua trailhead to the summit block of the First Flatiron.',
  2.4,
  1400,
  'https://gxoxxbzoykhvjgkbiuwx.supabase.co/storage/v1/object/public/gpx-files/DEF_+2019-10-15.gpx',
  'Starts at the Chautauqua Trailhead sign and ends upon touching the highest point of the First Flatiron summit block.',
  '• Human-powered only from trailhead to summit.
• Free solo or roped scrambling permitted.
• Timing begins at the Chautauqua trailhead sign.
• Timing stops when touching the highest point of the summit block.',
  ARRAY[
    'https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=1200'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Insert Kyle Richardson's 30:19 Effort
INSERT INTO efforts (route_id, athlete_id, time_seconds, formatted_time, activity_date, gpx_url, verified)
VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  1819,
  '30:19',
  '2019-10-15',
  'https://gxoxxbzoykhvjgkbiuwx.supabase.co/storage/v1/object/public/gpx-files/DEF_+2019-10-15.gpx',
  TRUE
)
ON CONFLICT (id) DO NOTHING;