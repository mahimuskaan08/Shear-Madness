import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
