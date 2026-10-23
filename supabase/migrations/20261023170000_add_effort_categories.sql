-- 1. Add category columns to efforts table
ALTER TABLE efforts 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male',
ADD COLUMN IF NOT EXISTS support_type TEXT DEFAULT 'Unsupported',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Overall';

-- 2. Update existing efforts with accurate category data
UPDATE efforts 
SET 
  gender = 'Male',
  support_type = 'Self-Supported',
  category = 'Overall'
WHERE route_id = 'f5353533-5353-5353-5353-535353535353'; -- 53 Classics

UPDATE efforts 
SET 
  gender = 'Male',
  support_type = 'Unsupported',
  category = 'Overall'
WHERE route_id = 'f1111111-1111-1111-1111-111111111111'; -- First Flatiron DEF