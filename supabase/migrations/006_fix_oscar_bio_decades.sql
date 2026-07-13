-- Fix Oscar's bio: "3 decades" / "three decades" → "nearly four decades" (user correction)
-- Uses negative lookbehind to avoid doubling "nearly" if already present
UPDATE team_members
SET bio = regexp_replace(
  regexp_replace(
    regexp_replace(bio, 'nearly\s+3 decades', 'nearly four decades', 'gi'),
    '(?<!nearly\s)3 decades',
    'nearly four decades',
    'gi'
  ),
  'three decades',
  'nearly four decades',
  'gi'
)
WHERE name ILIKE '%oscar%' OR name ILIKE '%victor%';
