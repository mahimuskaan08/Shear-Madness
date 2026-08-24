-- ============================================================
-- Shear Madness Hoboken — Supabase CMS Schema
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── BACKGROUNDS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS backgrounds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     text NOT NULL UNIQUE,
  image_url   text,
  image_path  text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Pre-seed all background sections
INSERT INTO backgrounds (section) VALUES
  ('hero'), ('about'), ('artist'), ('booking'),
  ('gallery'), ('contact'), ('services'), ('join'), ('credits')
ON CONFLICT (section) DO NOTHING;

-- ─── PORTFOLIO IMAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url           text NOT NULL,
  path          text NOT NULL,
  alt           text NOT NULL DEFAULT '',
  title         text NOT NULL DEFAULT '',
  category      text NOT NULL CHECK (category IN ('women', 'men', 'both')),
  featured      boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_images (category, display_order);

-- ─── SERVICES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  price         text NOT NULL,
  category      text NOT NULL CHECK (category IN ('womens', 'mens', 'treatments', 'bridal')),
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services (category, display_order);

-- Seed initial services
INSERT INTO services (name, price, category, display_order) VALUES
  ('Haircut & Blowout', '$85', 'womens', 1),
  ('Haircut', '$65', 'womens', 2),
  ('Blowout', '$55', 'womens', 3),
  ('Eyebrow Wax', '$20', 'womens', 4),
  ('Updo', '$95+', 'womens', 5),
  ('Single Process Colour', '$90+', 'womens', 6),
  ('Highlights (Partial)', '$120+', 'womens', 7),
  ('Highlights (Full)', '$165+', 'womens', 8),
  ('Color Correction', '$200+', 'womens', 9),
  ('Brazilian Keratin', '$300+', 'womens', 10),
  ('Hair Cut', '$35', 'mens', 1),
  ('Boy Child Cut', '$25', 'mens', 2),
  ('Single Process', '$70+', 'mens', 3),
  ('Highlights', '$90+', 'mens', 4),
  ('Intensive Conditioning', '$45', 'treatments', 1),
  ('Tandem Texture', '$150+', 'treatments', 2),
  ('Japanese Relaxer', '$250+', 'treatments', 3)
ON CONFLICT DO NOTHING;

-- ─── TEAM MEMBERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  position      text NOT NULL,
  bio           text NOT NULL DEFAULT '',
  image_url     text,
  image_path    text,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed existing team from site
INSERT INTO team_members (name, position, bio, display_order) VALUES
  ('Oscar Victor', 'Master Stylist & Co-Owner', 'With over 30 years of experience, Oscar brings artistry and passion to every client. Specializing in precision cuts and creative color, he has built a loyal following in the Hoboken community.', 1),
  ('George Fraggos', 'Senior Stylist & Co-Owner', 'George''s expertise in texture and transformation has made him one of Hoboken''s most sought-after stylists. His attention to detail and commitment to excellence define the Shear Madness experience.', 2)
ON CONFLICT DO NOTHING;

-- ─── TESTIMONIALS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name        text NOT NULL,
  customer_photo_url   text,
  customer_photo_path  text,
  review               text NOT NULL,
  rating               integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  is_visible           boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── BEFORE & AFTER GALLERY ──────────────────────────────────
CREATE TABLE IF NOT EXISTS before_after_gallery (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  before_image_url    text NOT NULL,
  before_image_path   text NOT NULL,
  after_image_url     text NOT NULL,
  after_image_path    text NOT NULL,
  display_order       integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ─── FAQ ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed some common FAQs
INSERT INTO faq (question, answer, display_order) VALUES
  ('Do I need an appointment?', 'Yes, we strongly recommend booking an appointment in advance. Walk-ins are welcome based on availability, but appointments are given priority.', 1),
  ('How far in advance should I book?', 'We recommend booking at least 1–2 weeks in advance, especially for color services and weekends.', 2),
  ('What is your cancellation policy?', 'We ask for at least 24 hours notice for cancellations or reschedules. Late cancellations may be subject to a fee.', 3),
  ('Do you offer gift cards?', 'Yes! Gift cards are available for purchase in the salon. Please call or visit us to purchase one.', 4),
  ('What payment methods do you accept?', 'We accept cash, all major credit cards, and contactless payments.', 5)
ON CONFLICT DO NOTHING;

-- ─── OPENING HOURS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opening_hours (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day           text NOT NULL UNIQUE,
  open_time     text,
  close_time    text,
  is_closed     boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Pre-seed all days
INSERT INTO opening_hours (day, open_time, close_time, is_closed, display_order) VALUES
  ('monday',    NULL,    NULL,    true,  1),
  ('tuesday',   '09:00', '18:00', false, 2),
  ('wednesday', '09:00', '18:00', false, 3),
  ('thursday',  '09:00', '18:00', false, 4),
  ('friday',    '09:00', '19:00', false, 5),
  ('saturday',  '09:00', '17:00', false, 6),
  ('sunday',    NULL,    NULL,    true,  7)
ON CONFLICT (day) DO NOTHING;

-- ─── HOLIDAY HOURS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holiday_hours (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  date              date NOT NULL,
  is_closed         boolean NOT NULL DEFAULT true,
  custom_open_time  text,
  custom_close_time text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── CONTACT INFO (single row) ───────────────────────────────
CREATE TABLE IF NOT EXISTS contact_info (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name   text NOT NULL DEFAULT 'Shear Madness Hoboken',
  phone           text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  address_line_1  text NOT NULL DEFAULT '',
  city_state_zip  text NOT NULL DEFAULT '',
  google_maps_url text NOT NULL DEFAULT '',
  booking_url     text NOT NULL DEFAULT '',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed initial contact info
INSERT INTO contact_info (business_name, phone, email, address_line_1, city_state_zip)
VALUES ('Shear Madness Hoboken', '', '', '', '')
ON CONFLICT DO NOTHING;

-- ─── SOCIAL MEDIA ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_media (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   text NOT NULL UNIQUE,
  url        text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pre-seed all platforms
INSERT INTO social_media (platform) VALUES
  ('instagram'), ('facebook'), ('pinterest')
ON CONFLICT (platform) DO NOTHING;

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'backgrounds', 'portfolio_images', 'services', 'team_members',
    'testimonials', 'before_after_gallery', 'faq', 'opening_hours',
    'holiday_hours', 'contact_info', 'social_media'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t, t, t
    );
  END LOOP;
END;
$$;
