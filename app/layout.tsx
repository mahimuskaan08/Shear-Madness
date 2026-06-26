import type { Metadata } from "next";
import "./globals.css";
import AudioPlayer from "@/components/AudioPlayer";
import LoadingScreen from "@/components/LoadingScreen";

const BASE_URL = "https://shearmadnesshoboken.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Shear Madness Hoboken | Premium Hair Salon for Men & Women",
  description:
    "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
  keywords: [
    "hair salon Hoboken NJ",
    "haircut Hoboken",
    "hair color Hoboken",
    "men's haircut Hoboken",
    "women's hair salon Hoboken",
    "Shear Madness Hoboken",
    "salon near me Hoboken",
    "bridal hair Hoboken",
    "hair treatments Hoboken",
  ],
  authors: [{ name: "Shear Madness Hoboken" }],
  creator: "Shear Madness Hoboken",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Shear Madness Hoboken",
    title: "Shear Madness Hoboken | Premium Hair Salon for Men & Women",
    description:
      "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shear Madness Hoboken - Premium Hair Salon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shear Madness Hoboken | Premium Hair Salon for Men & Women",
    description:
      "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the loader logo at highest priority — browser fetches it
            before parsing <body>, eliminating the blank delay.
            WebP (31 KB) instead of PNG (73 KB) = 58% less to download. */}
        <link
          rel="preload"
          as="image"
          href="/hero-logo.webp"
          type="image/webp"
          fetchPriority="high"
        />
        {/* PNG fallback preload for legacy browsers (rare, but safe) */}
        <link rel="preload" as="image" href="/hero-logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;500;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {/*
          Inline script runs synchronously before any paint — sets overflow:hidden
          and adds shear-loading so CSS animations are paused from frame 0.
          The React LoadingScreen re-applies these on mount and cleans them up.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.style.overflow='hidden';document.body.classList.add('shear-loading');`,
          }}
        />

        {/*
          Static instant loader — pure HTML, painted before JS hydrates.
          Eliminates the 3-5 s blank/content flash on slow connections.
          React LoadingScreen removes this div the moment it mounts.
        */}
        <div
          id="shear-instant-loader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(160deg, #FAF5EE 0%, #F4EBE0 30%, #EDE3D6 55%, #F2EBE0 80%, #FAF5EE 100%)",
          }}
        >
          {/* Warm centre glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(235,200,170,0.30) 0%, rgba(210,175,145,0.10) 50%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Logo — WebP (31 KB) with PNG fallback; both already preloaded above */}
          <picture style={{ position: "relative", zIndex: 1 }}>
            <source srcSet="/hero-logo.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-logo.png"
              alt="Shear Madness"
              style={{
                width: "clamp(220px, 45vw, 380px)",
                maxWidth: "80vw",
                height: "auto",
                display: "block",
                filter:
                  "drop-shadow(0 2px 20px rgba(196,169,106,0.32)) drop-shadow(0 0 44px rgba(230,200,170,0.18))",
              }}
            />
          </picture>
          {/* Subtitle */}
          <p
            style={{
              position: "relative",
              zIndex: 1,
              fontFamily: "Georgia, serif",
              fontSize: "clamp(0.68rem, 1.6vw, 0.86rem)",
              fontWeight: 400,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(58,56,50,0.56)",
              marginTop: "clamp(14px, 3vh, 28px)",
            }}
          >
            Beauty&nbsp;&bull;&nbsp;Passion&nbsp;&bull;&nbsp;Experience
          </p>
        </div>

        <LoadingScreen />
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}
