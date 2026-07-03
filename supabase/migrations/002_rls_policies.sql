-- ============================================================
-- Row Level Security (RLS) Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE backgrounds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_hours       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info        ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media        ENABLE ROW LEVEL SECURITY;

-- ─── PUBLIC READ (frontend needs this) ───────────────────────
-- Anyone can read all content tables
CREATE POLICY "public_read_backgrounds"          ON backgrounds         FOR SELECT USING (true);
CREATE POLICY "public_read_portfolio"            ON portfolio_images    FOR SELECT USING (true);
CREATE POLICY "public_read_services"             ON services            FOR SELECT USING (true);
CREATE POLICY "public_read_team"                 ON team_members        FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials"         ON testimonials        FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_before_after"         ON before_after_gallery FOR SELECT USING (true);
CREATE POLICY "public_read_faq"                  ON faq                 FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_hours"                ON opening_hours       FOR SELECT USING (true);
CREATE POLICY "public_read_holidays"             ON holiday_hours       FOR SELECT USING (true);
CREATE POLICY "public_read_contact"              ON contact_info        FOR SELECT USING (true);
CREATE POLICY "public_read_social"               ON social_media        FOR SELECT USING (true);

-- ─── AUTHENTICATED WRITE (admin only) ────────────────────────
-- Only logged-in users (admins created via Supabase Auth) can modify data

CREATE POLICY "auth_write_backgrounds"    ON backgrounds          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_portfolio"      ON portfolio_images     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_services"       ON services             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_team"           ON team_members         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_testimonials"   ON testimonials         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_before_after"   ON before_after_gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_faq"            ON faq                  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_hours"          ON opening_hours        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_holidays"       ON holiday_hours        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_contact"        ON contact_info         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_social"         ON social_media         FOR ALL USING (auth.role() = 'authenticated');

-- ─── STORAGE BUCKET POLICIES ─────────────────────────────────
-- Create these in Supabase Dashboard > Storage > Policies
-- Or run via SQL using storage schema:

-- Public read for all media
INSERT INTO storage.buckets (id, name, public) VALUES
  ('backgrounds',       'backgrounds',       true),
  ('portfolio',         'portfolio',         true),
  ('team-photos',       'team-photos',       true),
  ('testimonial-photos','testimonial-photos',true),
  ('before-after',      'before-after',      true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Allow authenticated users to upload/delete
CREATE POLICY "auth_upload_backgrounds"    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'backgrounds'        AND auth.role() = 'authenticated');
CREATE POLICY "auth_delete_backgrounds"    ON storage.objects FOR DELETE USING  (bucket_id = 'backgrounds'        AND auth.role() = 'authenticated');
CREATE POLICY "auth_upload_portfolio"      ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio'          AND auth.role() = 'authenticated');
CREATE POLICY "auth_delete_portfolio"      ON storage.objects FOR DELETE USING  (bucket_id = 'portfolio'          AND auth.role() = 'authenticated');
CREATE POLICY "auth_upload_team"           ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-photos'        AND auth.role() = 'authenticated');
CREATE POLICY "auth_delete_team"           ON storage.objects FOR DELETE USING  (bucket_id = 'team-photos'        AND auth.role() = 'authenticated');
CREATE POLICY "auth_upload_testimonials"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonial-photos' AND auth.role() = 'authenticated');
CREATE POLICY "auth_delete_testimonials"   ON storage.objects FOR DELETE USING  (bucket_id = 'testimonial-photos' AND auth.role() = 'authenticated');
CREATE POLICY "auth_upload_before_after"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'before-after'       AND auth.role() = 'authenticated');
CREATE POLICY "auth_delete_before_after"   ON storage.objects FOR DELETE USING  (bucket_id = 'before-after'       AND auth.role() = 'authenticated');

-- Public read for all storage objects
CREATE POLICY "public_read_storage" ON storage.objects FOR SELECT USING (
  bucket_id IN ('backgrounds', 'portfolio', 'team-photos', 'testimonial-photos', 'before-after')
);
