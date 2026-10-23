-- 1. Ensure support_type and gender columns accept all required categories
ALTER TABLE efforts 
  DROP CONSTRAINT IF EXISTS check_gender,
  DROP CONSTRAINT IF EXISTS check_support_type;

ALTER TABLE efforts
  ADD CONSTRAINT check_gender CHECK (gender IN ('Male', 'Female', 'Non-Binary')),
  ADD CONSTRAINT check_support_type CHECK (support_type IN ('Supported', 'Unsupported', 'Self-Supported'));

-- 2. Update DEF First Flatiron Route Rules & Definition
UPDATE routes
SET rules = '• Supported: A rope is carried and/or used to rappel off the back/descent.
• Unsupported: No rope or technical gear permitted (ascent and downclimb must be done unroped).
• Companionship: Running or scrambling with partners is allowed.
• Strict No-Assistance: Partners or pacers may NOT assist in any way (no physical contact, no sharing/handing off gear, water, or food).'
WHERE id = 'f1111111-1111-1111-1111-111111111111'; -- First Flatiron DEF Route ID