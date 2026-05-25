import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/wp-admin/", "/wp-login.php"],
      },
    ],
    sitemap: "https://shearmadnesshoboken.com/sitemap.xml",
    host: "https://shearmadnesshoboken.com",
  };
}
