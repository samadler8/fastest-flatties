-- 1. Add dynamic JSONB column for route definitions and array column for effort tags
ALTER TABLE routes ADD COLUMN IF NOT EXISTS category_definitions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE efforts ADD COLUMN IF NOT EXISTS category_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Configure Custom Categories for First Flatiron (DEF)
UPDATE routes
SET category_definitions = '[
  {
    "group": "Gender",
    "definitions": [
      { "name": "Male" },
      { "name": "Female" },
      { "name": "Non-Binary" }
    ]
  },
  {
    "group": "Support Style",
    "definitions": [
      { "name": "Unsupported", "description": "No rope or technical gear carried or used. Ascent and downclimb must be done unroped." },
      { "name": "Supported", "description": "A rope is carried and/or used for rappelling the descent off the back." }
    ]
  }
]'::jsonb
WHERE id = 'f1111111-1111-1111-1111-111111111111';

-- 3. Configure Custom Categories for 53 Classics Linkup
UPDATE routes
SET category_definitions = '[
  {
    "group": "Party Format",
    "definitions": [
      { "name": "Team", "description": "Two or more athletes moving continuously together throughout the linkup." },
      { "name": "Solo", "description": "Single athlete completing all formations unassisted by movement partners." }
    ]
  },
  {
    "group": "Support Level",
    "definitions": [
      { "name": "Self-Supported", "description": "Pre-stashed supplies permitted ahead of time; no active support crew or live hand-offs." },
      { "name": "Supported", "description": "Active crew, pacers, and live resupply allowed throughout attempt." },
      { "name": "Unsupported", "description": "Must carry all supplies from start to finish, using only public natural water sources." }
    ]
  }
]'::jsonb
WHERE id = 'f5353533-5353-5353-5353-535353535353';

-- 4. Tag existing efforts with their route-specific categories
UPDATE efforts 
SET category_tags = ARRAY['Male', 'Unsupported']
WHERE route_id = 'f1111111-1111-1111-1111-111111111111';

UPDATE efforts 
SET category_tags = ARRAY['Team', 'Self-Supported']
WHERE route_id = 'f5353533-5353-5353-5353-535353535353';