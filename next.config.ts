import type { NextConfig } from "next";

// Old WordPress URLs → new Next.js routes (301 permanent)
const wpRedirects = [
  { source: "/the-salon",                  destination: "/" },
  { source: "/our-team",                   destination: "/" },
  { source: "/about-shear-madness",        destination: "/" },
  { source: "/meaning-behind-the-madness", destination: "/" },
  { source: "/services-list",              destination: "/services" },
  { source: "/price-list",                 destination: "/services" },
  { source: "/specials",                   destination: "/services" },
  { source: "/products",                   destination: "/services" },
  { source: "/online-appointment-book",    destination: "/booking" },
  { source: "/contact-us",                 destination: "/contact" },
  { source: "/videos",                     destination: "/gallery" },
];

const securityHeaders = [
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.shearmadnesshoboken.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    // Each WP path gets two rules: with and without trailing slash
    return wpRedirects.flatMap(({ source, destination }) => [
      { source,             destination, permanent: true },
      { source: source + "/", destination, permanent: true },
    ]);
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
