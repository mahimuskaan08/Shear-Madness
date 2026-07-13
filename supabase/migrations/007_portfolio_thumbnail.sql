-- Add dedicated thumbnail columns separate from the main multi-angle url
ALTER TABLE portfolio_images
  ADD COLUMN IF NOT EXISTS thumbnail_url  text,
  ADD COLUMN IF NOT EXISTS thumbnail_path text;
