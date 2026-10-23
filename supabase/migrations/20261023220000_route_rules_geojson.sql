ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS rules_markdown TEXT,
ADD COLUMN IF NOT EXISTS rules_geojson JSONB;

-- Example: Populate 53 Classics with interactive GeoJSON checkpoints and corridors
UPDATE routes
SET 
  rules_markdown = '# 53 Flatiron Classics Linkup Rules & Standards

## 1. Overview & Timing
The timer starts the moment the athlete leaves the **Chautauqua Ranger Cottage** step threshold and stops upon return to the same point. 

## 2. Required Checkpoints
Athletes must pass within the designated proximity radius of each formation in sequential order:
* [Checkpoint 1: First Flatiron Summit](#cp-1) — 10m proximity required. Descent via standard rappel or downclimb.
* [Checkpoint 2: Third Flatiron Summit](#cp-2) — 15m proximity required.
* [Freestyle Corridor 1](#zone-1) — Any route between 3rd Flatiron and Green Mountain trail is permitted.

## 3. Category Constraints
* **Unsupported**: No stashed gear or pacing allowed.
* **Supported**: Stashed supplies permitted at designated road crossings.',

  rules_geojson = '{
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": "cp-1",
        "properties": {
          "name": "First Flatiron Summit",
          "type": "checkpoint",
          "sequence_order": 1,
          "radius_meters": 10,
          "description": "Must touch or pass within 10 meters of the highest point."
        },
        "geometry": { "type": "Point", "coordinates": [-105.2925, 39.9881] }
      },
      {
        "type": "Feature",
        "id": "cp-2",
        "properties": {
          "name": "Third Flatiron Summit",
          "type": "checkpoint",
          "sequence_order": 2,
          "radius_meters": 15,
          "description": "Must pass within 15 meters of summit eyebolt."
        },
        "geometry": { "type": "Point", "coordinates": [-105.2951, 39.9812] }
      },
      {
        "type": "Feature",
        "id": "zone-1",
        "properties": {
          "name": "3rd Flatiron to Green Mountain Corridor",
          "type": "freestyle_zone",
          "description": "Freestyle navigation allowed; any scramble or trail choice permitted."
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-105.2960, 39.9810],
            [-105.2990, 39.9820],
            [-105.2980, 39.9780],
            [-105.2960, 39.9810]
          ]]
        }
      }
    ]
  }'::jsonb
WHERE id = 'f5353533-5353-5353-5353-535353535353';