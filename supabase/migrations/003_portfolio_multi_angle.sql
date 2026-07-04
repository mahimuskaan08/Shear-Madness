-- Add multi-angle images support to portfolio_images
-- Each entry stores an array of { url, path } objects for additional angle shots

ALTER TABLE portfolio_images
  ADD COLUMN IF NOT EXISTS multi_angle_images jsonb NOT NULL DEFAULT '[]';
