-- The salon has no TikTok account but does have Pinterest.
INSERT INTO social_media (platform, url, is_enabled)
VALUES ('pinterest', 'https://www.pinterest.com/ShearMadnessHob/', true)
ON CONFLICT (platform) DO UPDATE
  SET url        = EXCLUDED.url,
      is_enabled = true;

DELETE FROM social_media WHERE platform = 'tiktok';
