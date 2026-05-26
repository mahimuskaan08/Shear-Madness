export const dynamic = "force-dynamic";

export async function GET() {
  const WP_BASE = (process.env.WP_BASE_URL ?? "").replace(/\/$/, "");

  if (!WP_BASE) {
    return Response.json({ error: "WP_BASE_URL env var is NOT set on this server" });
  }

  const endpoint = `${WP_BASE}/wp-json/shear/v1/site-images`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const data = await res.json();
    return Response.json({
      ok:                       true,
      http_status:              res.status,
      wp_base:                  WP_BASE,
      gallery_background_image: data.gallery_background_image ?? null,
      hero_background_image:    data.hero_background_image    ?? null,
    });
  } catch (err) {
    return Response.json({ error: String(err), wp_base: WP_BASE });
  }
}
