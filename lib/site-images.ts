export type CmsGalleryImage = {
  url:   string;
  alt:   string;
  title: string;
};

export type SiteImages = {
  // Single image fields — null when not set
  hero_background_image:          string | null;
  about_background_image:         string | null;
  about_us_images:                string[];
  artist_background_image:        string | null;
  oscar_artist_image:             string | null;
  george_artist_image:            string | null;
  booking_background_image:       string | null;
  join_background_image:          string | null;
  gallery_background_image:       string | null;
  contact_background_image:       string | null;
  credits_background_image:       string | null;
  services_page_background_image: string | null;
  gallery_images:                 CmsGalleryImage[];
  // Text / business info fields — empty string when not set
  site_phone:          string;
  site_email:          string;
  site_address_line_1: string;
  site_city_state_zip: string;
  hours_tue_thu:       string;
  hours_fri:           string;
  hours_sat:           string;
  hours_sun_mon:       string;
  google_maps_url:     string;
};

const EMPTY: SiteImages = {
  hero_background_image:          null,
  about_background_image:         null,
  about_us_images:                [],
  artist_background_image:        null,
  oscar_artist_image:             null,
  george_artist_image:            null,
  booking_background_image:       null,
  join_background_image:          null,
  gallery_background_image:       null,
  contact_background_image:       null,
  credits_background_image:       null,
  services_page_background_image: null,
  gallery_images:                 [],
  site_phone:          "",
  site_email:          "",
  site_address_line_1: "",
  site_city_state_zip: "",
  hours_tue_thu:       "",
  hours_fri:           "",
  hours_sat:           "",
  hours_sun_mon:       "",
  google_maps_url:     "",
};

const SINGLE_KEYS: (keyof SiteImages)[] = [
  "hero_background_image",
  "about_background_image",
  "artist_background_image",
  "oscar_artist_image",
  "george_artist_image",
  "booking_background_image",
  "join_background_image",
  "gallery_background_image",
  "contact_background_image",
  "credits_background_image",
  "services_page_background_image",
];

const TEXT_KEYS: (keyof SiteImages)[] = [
  "site_phone", "site_email", "site_address_line_1", "site_city_state_zip",
  "hours_tue_thu", "hours_fri", "hours_sat", "hours_sun_mon", "google_maps_url",
];

function toStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function toStringOrEmpty(v: unknown): string {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : "";
}

const WP_BASE  = (process.env.WP_BASE_URL ?? "").replace(/\/$/, "");
const ENDPOINT = `${WP_BASE}/wp-json/shear/v1/site-images`;

export async function getSiteImages(): Promise<SiteImages> {
  if (!WP_BASE) return EMPTY;
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    const raw = (await res.json()) as Record<string, unknown>;
    console.log("[CMS] gallery_background_image:", raw.gallery_background_image);
    const merged = { ...EMPTY, ...raw } as SiteImages;
    // Normalise single-image fields: null / undefined / "" / false → null
    for (const key of SINGLE_KEYS) {
      (merged as Record<string, unknown>)[key] = toStringOrNull(merged[key]);
    }
    // Normalise text fields: null / undefined / false → ""
    for (const key of TEXT_KEYS) {
      (merged as Record<string, unknown>)[key] = toStringOrEmpty(merged[key]);
    }
    return merged;
  } catch {
    return EMPTY;
  }
}
