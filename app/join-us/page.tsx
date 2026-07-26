import type { Metadata } from "next";
import JoinUsPageContent from "@/components/JoinUsPageContent";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join Our Team | Shear Madness Hoboken",
  description:
    "Join the Shear Madness family in Hoboken, NJ. We're looking for passionate, detail-driven hair stylists to grow with our team.",
  alternates: { canonical: "/join-us" },
  openGraph: {
    title: "Join Our Team | Shear Madness Hoboken",
    description:
      "Join the Shear Madness family in Hoboken, NJ. We're looking for passionate, detail-driven hair stylists to grow with our team.",
    url: "/join-us",
  },
};

export default async function JoinUsPage() {
  const data = await getSiteData();
  const bg = (section: string) =>
    data.backgrounds.find(b => b.section === section)?.image_url ?? undefined;

  return (
    <JoinUsPageContent
      bgImage={bg("join_desktop")}
      bgImageTablet={bg("join_tablet")}
      bgImageMobile={bg("join_mobile")}
    />
  );
}
