/**
 * One-shot migration: WordPress → Supabase
 * Run with: node --env-file=.env.local scripts/migrate-wp-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js"

const WP_BASE = (process.env.WP_BASE_URL ?? "").replace(/\/$/, "")
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!WP_BASE || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars. Make sure .env.local has WP_BASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 1. Fetch from WordPress ───────────────────────────────────────────────────
console.log("Fetching from WordPress...")
const res = await fetch(`${WP_BASE}/wp-json/shear/v1/site-images`, { cache: "no-store" })
if (!res.ok) {
  console.error(`WordPress API returned ${res.status}. Check WP_BASE_URL.`)
  process.exit(1)
}
const wp = await res.json()
console.log("WordPress data received.\n")

// ── 2. Backgrounds ────────────────────────────────────────────────────────────
console.log("Migrating backgrounds...")
const backgroundMap = {
  hero:     wp.hero_background_image,
  about:    wp.about_background_image,
  artist:   wp.artist_background_image,
  booking:  wp.booking_background_image,
  gallery:  wp.gallery_background_image,
  contact:  wp.contact_background_image,
  credits:  wp.credits_background_image,
  services: wp.services_page_background_image,
  join:     wp.join_background_image,
}

for (const [section, image_url] of Object.entries(backgroundMap)) {
  if (!image_url) { console.log(`  ${section}: (no image, skipping)`); continue }
  const { error } = await supabase
    .from("backgrounds")
    .update({ image_url })
    .eq("section", section)
  if (error) console.error(`  ${section}: ERROR —`, error.message)
  else console.log(`  ${section}: ✓`)
}

// ── 3. Portfolio images ───────────────────────────────────────────────────────
console.log("\nMigrating portfolio/gallery images...")
const galleryImages = wp.gallery_images ?? []
if (galleryImages.length === 0) {
  console.log("  No gallery images found in WordPress.")
} else {
  // Clear existing and re-insert to avoid duplicates on re-run
  await supabase.from("portfolio_images").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  const rows = galleryImages.map((img, i) => ({
    url: img.url,
    alt: img.alt ?? "",
    title: img.title ?? "",
    category: "both",
    featured: i < 6,
    display_order: i + 1,
    path: img.url, // external URL — no storage path
  }))
  const { error } = await supabase.from("portfolio_images").insert(rows)
  if (error) console.error("  ERROR —", error.message)
  else console.log(`  ✓ Inserted ${rows.length} images`)
}

// ── 4. Team member photos ─────────────────────────────────────────────────────
console.log("\nMigrating team photos...")
const teamUpdates = [
  { name: "Oscar Victor",   image_url: wp.oscar_artist_image },
  { name: "George Fraggos", image_url: wp.george_artist_image },
]
for (const { name, image_url } of teamUpdates) {
  if (!image_url) { console.log(`  ${name}: (no image, skipping)`); continue }
  const { error } = await supabase
    .from("team_members")
    .update({ image_url })
    .eq("name", name)
  if (error) console.error(`  ${name}: ERROR —`, error.message)
  else console.log(`  ${name}: ✓`)
}

// ── 5. Contact info ───────────────────────────────────────────────────────────
console.log("\nMigrating contact info...")
const contactFields = {
  phone:          wp.site_phone          ?? "",
  email:          wp.site_email          ?? "",
  address_line_1: wp.site_address_line_1 ?? "",
  city_state_zip: wp.site_city_state_zip ?? "",
  google_maps_url: wp.google_maps_url    ?? "",
}
const { error: contactErr } = await supabase
  .from("contact_info")
  .update(contactFields)
  .neq("id", "00000000-0000-0000-0000-000000000000") // update the single row
if (contactErr) console.error("  ERROR —", contactErr.message)
else console.log("  ✓", JSON.stringify(contactFields, null, 2).replace(/\n/g, "\n  "))

// ── 6. Hours (best-effort parse) ──────────────────────────────────────────────
console.log("\nMigrating hours...")

function parseHours(str) {
  if (!str || str.toLowerCase().includes("closed")) return { open_time: null, close_time: null, is_closed: true }
  // Match patterns like "9:00 AM - 6:00 PM", "9am-6pm", "9 AM to 7 PM"
  const match = str.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i)
  if (!match) return { open_time: str, close_time: null, is_closed: false }
  return { open_time: match[1].trim(), close_time: match[2].trim(), is_closed: false }
}

const hoursMap = [
  { days: ["tuesday", "wednesday", "thursday"], str: wp.hours_tue_thu },
  { days: ["friday"],                            str: wp.hours_fri },
  { days: ["saturday"],                          str: wp.hours_sat },
  { days: ["sunday", "monday"],                  str: wp.hours_sun_mon },
]

for (const { days, str } of hoursMap) {
  const parsed = parseHours(str)
  for (const day of days) {
    const { error } = await supabase
      .from("opening_hours")
      .update(parsed)
      .eq("day", day)
    if (error) console.error(`  ${day}: ERROR —`, error.message)
    else console.log(`  ${day}: ✓  (${str ?? "not set"})`)
  }
}

console.log("\nMigration complete. Review the CMS admin to verify.")
