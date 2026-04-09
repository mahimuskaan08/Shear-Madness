import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shear Madness Hoboken | Where Style Meets Balance",
  description:
    "A modern salon experience rooted in calm, precision, and care. Located in the heart of Hoboken, NJ.",
  keywords:
    "hair salon, Hoboken, NJ, haircut, color, styling, zen, Asian-inspired, premium salon",
  openGraph: {
    title: "Shear Madness Hoboken | Where Style Meets Balance",
    description:
      "A modern salon experience rooted in calm, precision, and care.",
    type: "website",
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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
