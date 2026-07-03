import { NextResponse } from "next/server"
import { getSiteImages } from "@/lib/site-images"
import { createSupabaseServiceClient } from "@/lib/supabase/server"

// DELETE this file after running the migration once.
export async function POST() {
  const supabase = createSupabaseServiceClient()
  const wp = await getSiteImages()
  const results: Record<string, string> = {}

  // Backgrounds
  const backgroundMap: Record<string, string | null> = {
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
    if (!image_url) { results[`bg_${section}`] = "skipped (no image)"; continue }
    const { error } = await supabase.from("backgrounds").update({ image_url }).eq("section", section)
    results[`bg_${section}`] = error ? `ERROR: ${error.message}` : "ok"
  }

  // Portfolio images
  const galleryImages = wp.gallery_images ?? []
  if (galleryImages.length > 0) {
    await supabase.from("portfolio_images").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    const rows = galleryImages.map((img, i) => ({
      url: img.url, alt: img.alt ?? "", title: img.title ?? "",
      category: "both" as const, featured: i < 6, display_order: i + 1, path: img.url,
    }))
    const { error } = await supabase.from("portfolio_images").insert(rows)
    results["portfolio"] = error ? `ERROR: ${error.message}` : `ok (${rows.length} images)`
  } else {
    results["portfolio"] = "skipped (no images in WordPress)"
  }

  // Team photos
  const teamUpdates = [
    { name: "Oscar Victor",   image_url: wp.oscar_artist_image },
    { name: "George Fraggos", image_url: wp.george_artist_image },
  ]
  for (const { name, image_url } of teamUpdates) {
    if (!image_url) { results[`team_${name}`] = "skipped (no image)"; continue }
    const { error } = await supabase.from("team_members").update({ image_url }).eq("name", name)
    results[`team_${name}`] = error ? `ERROR: ${error.message}` : "ok"
  }

  // Contact info
  const { error: contactErr } = await supabase.from("contact_info").update({
    phone:           wp.site_phone          ?? "",
    email:           wp.site_email          ?? "",
    address_line_1:  wp.site_address_line_1 ?? "",
    city_state_zip:  wp.site_city_state_zip ?? "",
    google_maps_url: wp.google_maps_url     ?? "",
  }).neq("id", "00000000-0000-0000-0000-000000000000")
  results["contact"] = contactErr ? `ERROR: ${contactErr.message}` : "ok"

  // Hours
  function parseHours(str: string | undefined) {
    if (!str || str.toLowerCase().includes("closed")) return { open_time: null, close_time: null, is_closed: true }
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
      const { error } = await supabase.from("opening_hours").update(parsed).eq("day", day)
      results[`hours_${day}`] = error ? `ERROR: ${error.message}` : `ok (${str ?? "not set"})`
    }
  }

  return NextResponse.json({ success: true, results })
}
