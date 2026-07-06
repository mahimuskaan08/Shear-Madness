/**
 * Supabase-powered data layer for the public frontend.
 * Replaces the WordPress REST API calls in site-images.ts.
 * Use getSiteData() in page Server Components.
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

// Public read-only client — safe to use in Server Components
function getPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type SiteBackground = {
  section: string
  image_url: string | null
}

export type SiteService = {
  id: string
  name: string
  price: string
  category: "womens" | "mens" | "treatments" | "bridal"
  display_order: number
}

export type SiteTeamMember = {
  id: string
  name: string
  position: string
  bio: string
  image_url: string | null
  display_order: number
}

export type SiteTestimonial = {
  id: string
  customer_name: string
  customer_photo_url: string | null
  review: string
  rating: number
}

export type PortfolioAngleImage = {
  url: string
  path: string
}

export type SitePortfolioImage = {
  id: string
  url: string       // display / preview image (shown in the card)
  full_url?: string // full image shown in lightbox; falls back to url if absent
  alt: string
  title: string
  category: "women" | "men" | "both"
  featured: boolean
  display_order: number
  multi_angle_images?: PortfolioAngleImage[]
}

export type SiteBeforeAfter = {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  display_order: number
}

export type SiteFAQ = {
  id: string
  question: string
  answer: string
  display_order: number
}

export type SiteHours = {
  day: string
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  display_order: number
}

export type SiteHoliday = {
  id: string
  name: string
  date: string
  is_closed: boolean
  custom_open_time: string | null
  custom_close_time: string | null
}

export type SiteContact = {
  business_name: string
  phone: string
  email: string
  address_line_1: string
  city_state_zip: string
  google_maps_url: string
  booking_url: string
}

export type SiteSocial = {
  platform: string
  url: string
  is_enabled: boolean
}

export type SiteData = {
  backgrounds: SiteBackground[]
  services: SiteService[]
  team: SiteTeamMember[]
  testimonials: SiteTestimonial[]
  portfolioImages: SitePortfolioImage[]
  beforeAfter: SiteBeforeAfter[]
  faq: SiteFAQ[]
  hours: SiteHours[]
  holidays: SiteHoliday[]
  contact: SiteContact | null
  social: SiteSocial[]
}

export async function getSiteData(): Promise<SiteData> {
  const supabase = getPublicClient()

  const [
    bgRes,
    svcRes,
    teamRes,
    testimonialRes,
    portfolioRes,
    baRes,
    faqRes,
    hoursRes,
    holidayRes,
    contactRes,
    socialRes,
  ] = await Promise.all([
    supabase.from("backgrounds").select("section, image_url"),
    supabase.from("services").select("id, name, price, category, display_order").eq("is_visible", true).order("display_order"),
    supabase.from("team_members").select("id, name, position, bio, image_url, display_order").order("display_order"),
    supabase.from("testimonials").select("id, customer_name, customer_photo_url, review, rating").eq("is_visible", true).order("created_at", { ascending: false }),
    supabase.from("portfolio_images").select("id, url, alt, title, category, featured, display_order").order("display_order"),
    supabase.from("before_after_gallery").select("id, title, before_image_url, after_image_url, display_order").order("display_order"),
    supabase.from("faq").select("id, question, answer, display_order").eq("is_visible", true).order("display_order"),
    supabase.from("opening_hours").select("day, open_time, close_time, is_closed, display_order").order("display_order"),
    supabase.from("holiday_hours").select("id, name, date, is_closed, custom_open_time, custom_close_time").order("date"),
    supabase.from("contact_info").select("business_name, phone, email, address_line_1, city_state_zip, google_maps_url, booking_url").single(),
    supabase.from("social_media").select("platform, url, is_enabled"),
  ])

  return {
    backgrounds: (bgRes.data as SiteBackground[]) ?? [],
    services: (svcRes.data as SiteService[]) ?? [],
    team: (teamRes.data as SiteTeamMember[]) ?? [],
    testimonials: (testimonialRes.data as SiteTestimonial[]) ?? [],
    portfolioImages: (portfolioRes.data as SitePortfolioImage[]) ?? [],
    beforeAfter: (baRes.data as SiteBeforeAfter[]) ?? [],
    faq: (faqRes.data as SiteFAQ[]) ?? [],
    hours: (hoursRes.data as SiteHours[]) ?? [],
    holidays: (holidayRes.data as SiteHoliday[]) ?? [],
    contact: contactRes.data as SiteContact | null,
    social: (socialRes.data as SiteSocial[]) ?? [],
  }
}

// Convenience helpers used by individual pages
export async function getBackground(
  section: string,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): Promise<string | null> {
  const supabase = getPublicClient()
  const key = device === "desktop" ? section : `${section}_${device}`
  const { data } = await supabase
    .from("backgrounds")
    .select("image_url")
    .eq("section", key)
    .maybeSingle()
  if (data?.image_url) return (data as { image_url: string | null }).image_url
  // Fall back to the base section key if no device-specific image exists
  if (device !== "desktop") {
    const { data: fallback } = await supabase
      .from("backgrounds")
      .select("image_url")
      .eq("section", section)
      .maybeSingle()
    return (fallback as { image_url: string | null } | null)?.image_url ?? null
  }
  return null
}

export async function getPortfolioByCategory(category: "women" | "men" | "both") {
  const supabase = getPublicClient()
  const { data } = await supabase
    .from("portfolio_images")
    .select("id, url, alt, title, featured, display_order")
    .eq("category", category)
    .order("display_order")
  return (data as SitePortfolioImage[]) ?? []
}

export function buildFooterHours(hours: SiteHours[]): {
  hoursTueThu: string
  hoursFri:    string
  hoursSat:    string
  hoursSunMon: string
} {
  const byDay: Record<string, SiteHours> = {}
  for (const h of hours) byDay[h.day] = h

  function to12h(time: string): string {
    const [hStr, mStr] = time.split(":")
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const period = h >= 12 ? "pm" : "am"
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`
  }

  function fmt(h?: SiteHours): string {
    if (!h || h.is_closed || !h.open_time || !h.close_time) return "Closed"
    return `${to12h(h.open_time)} – ${to12h(h.close_time)}`
  }

  return {
    hoursTueThu: fmt(byDay.tuesday),
    hoursFri:    fmt(byDay.friday),
    hoursSat:    fmt(byDay.saturday),
    hoursSunMon: fmt(byDay.sunday),
  }
}

export async function getHoursForToday(): Promise<{
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
  isHoliday: boolean
  holidayName?: string
}> {
  const supabase = getPublicClient()
  const today = new Date()
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  const todayStr = today.toISOString().slice(0, 10)

  const [hoursRes, holidayRes] = await Promise.all([
    supabase.from("opening_hours").select("*").eq("day", dayName).single(),
    supabase.from("holiday_hours").select("*").eq("date", todayStr).single(),
  ])

  type HolidayRow = { is_closed: boolean; custom_open_time: string | null; custom_close_time: string | null; name: string }
  type HoursRow = { is_closed: boolean; open_time: string | null; close_time: string | null }

  const holiday = holidayRes.data as HolidayRow | null
  if (holiday) {
    return {
      isOpen: !holiday.is_closed,
      openTime: holiday.custom_open_time,
      closeTime: holiday.custom_close_time,
      isHoliday: true,
      holidayName: holiday.name,
    }
  }

  const h = hoursRes.data as HoursRow | null
  return {
    isOpen: !!h && !h.is_closed,
    openTime: h?.open_time ?? null,
    closeTime: h?.close_time ?? null,
    isHoliday: false,
  }
}
