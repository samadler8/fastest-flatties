-- Remove exact duplicate effort records if any exist
DELETE FROM efforts a
USING efforts b
WHERE a.id > b.id
  AND a.route_id = b.route_id
  AND a.athlete_id = b.athlete_id
  AND a.time_seconds = b.time_seconds
  AND a.activity_date = b.activity_date;