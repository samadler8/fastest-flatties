-- 1. Insert Athletes (Mike Palmer & Ari)
INSERT INTO athletes (id, name, instagram)
VALUES 
  ('a2222222-2222-2222-2222-222222222222', 'Mike Palmer', NULL),
  ('a3333333-3333-3333-3333-333333333333', 'Ari', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Route Entry for 53 Classics Linkup
INSERT INTO routes (
  id, 
  name, 
  description, 
  distance_miles, 
  elevation_gain_ft, 
  gpx_url, 
  start_finish, 
  rules, 
  photos
)
VALUES (
  'f5353533-5353-5353-5353-535353535353',
  '53 Flatiron Classics Linkup',
  'A massive linkup of 53 classic Flatiron scrambles across the Boulder mountain park system.',
  28.56,
  19075,
  'https://gxoxxbzoykhvjgkbiuwx.supabase.co/storage/v1/object/public/gpx-files/53classics_2026-10-17.gpx',
  'Starts and finishes at Chautauqua Ranger Cottage.',
  '• Human-powered movement between all 53 formations.
• Supported, self-supported, or unsupported attempts permitted.
• Standard scrambling or roped climbing allowed on all faces.
• Continuous clock from start to finish.',
  ARRAY[
    'https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=1200'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  distance_miles = EXCLUDED.distance_miles,
  elevation_gain_ft = EXCLUDED.elevation_gain_ft,
  gpx_url = EXCLUDED.gpx_url,
  start_finish = EXCLUDED.start_finish,
  rules = EXCLUDED.rules,
  photos = EXCLUDED.photos;

-- 3. Insert Joint Efforts for Mike Palmer & Ari (27:52:34)
INSERT INTO efforts (route_id, athlete_id, time_seconds, formatted_time, activity_date, gpx_url, verified)
VALUES 
  (
    'f5353533-5353-5353-5353-535353535353',
    'a2222222-2222-2222-2222-222222222222', -- Mike Palmer
    100354,
    '27:52:34',
    '2026-10-17',
    'https://gxoxxbzoykhvjgkbiuwx.supabase.co/storage/v1/object/public/gpx-files/53classics_2026-10-17.gpx',
    TRUE
  ),
  (
    'f5353533-5353-5353-5353-535353535353',
    'a3333333-3333-3333-3333-333333333333', -- Ari
    100354,
    '27:52:34',
    '2026-10-17',
    'https://gxoxxbzoykhvjgkbiuwx.supabase.co/storage/v1/object/public/gpx-files/53classics_2026-10-17.gpx',
    TRUE
  );