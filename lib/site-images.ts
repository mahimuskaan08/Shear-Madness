export type CmsGalleryImage = {
  url:   string;
  alt:   string;
  title: string;
};

export type SiteImages = {
  hero_background_image:    string | null;
  about_background_image:   string | null;
  about_us_images:          string[];
  artist_background_image:  string | null;
  oscar_artist_image:       string | null;
  george_artist_image:      string | null;
  booking_background_image: string | null;
  join_background_image:    string | null;
  gallery_background_image: string | null;
  contact_background_image: string | null;
  gallery_images:           CmsGalleryImage[];
};

const EMPTY: SiteImages = {
  hero_background_image:    null,
  about_background_image:   null,
  about_us_images:          [],
  artist_background_image:  null,
  oscar_artist_image:       null,
  george_artist_image:      null,
  booking_background_image: null,
  join_background_image:    null,
  gallery_background_image: null,
  contact_background_image: null,
  gallery_images:           [],
};

const WP_BASE  = (process.env.WP_BASE_URL ?? "").replace(/\/$/, "");
const ENDPOINT = `${WP_BASE}/wp-json/shear/v1/site-images`;

export async function getSiteImages(): Promise<SiteImages> {
  if (!WP_BASE) return EMPTY;
  try {
    const res = await fetch(ENDPOINT, { next: { revalidate: 60 } });
    if (!res.ok) return EMPTY;
    const data = (await res.json()) as Partial<SiteImages>;
    return { ...EMPTY, ...data };
  } catch {
    return EMPTY;
  }
}
