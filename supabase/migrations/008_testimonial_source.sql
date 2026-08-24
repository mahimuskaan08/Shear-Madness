-- Reviews are copied over from Google or Fresha, so each one records where it
-- came from. Existing rows were all Google reviews.
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'google';

ALTER TABLE testimonials DROP CONSTRAINT IF EXISTS testimonials_source_check;
ALTER TABLE testimonials
  ADD CONSTRAINT testimonials_source_check CHECK (source IN ('google', 'fresha'));

-- The admin form no longer uploads customer photos. customer_photo_url /
-- customer_photo_path stay in place so existing rows keep their data.

-- Harden the admin write policy: FOR ALL with only a USING clause leans on
-- Postgres reusing it as the INSERT check, and auth.role() is deprecated in
-- Supabase. Spell out both clauses against auth.uid() instead.
DROP POLICY IF EXISTS "auth_write_testimonials" ON testimonials;
CREATE POLICY "auth_write_testimonials" ON testimonials
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
