-- 1. Update 53 Classics Category Definitions
UPDATE routes
SET category_definitions = '[
  {
    "group": "Gender & Format",
    "definitions": [
      { "name": "Male" },
      { "name": "Female" },
      { "name": "Non-Binary" },
      { "name": "Team", "description": "Two or more athletes moving continuously together throughout the linkup." }
    ]
  },
  {
    "group": "Support Style",
    "definitions": [
      { "name": "Unsupported", "description": "No pre-stashed supplies, active crew, pacers, hand-offs, or roped assistance." },
      { "name": "Supported", "description": "Active crew, pre-stashed supplies, pacers, or live hand-offs permitted." }
    ]
  }
]'::jsonb
WHERE id = 'f5353533-5353-5353-5353-535353535353';

-- 2. Tag Mike Palmer & Ari's effort as Team + Male + Supported
UPDATE efforts 
SET category_tags = ARRAY['Team', 'Male', 'Supported']
WHERE route_id = 'f5353533-5353-5353-5353-535353535353';