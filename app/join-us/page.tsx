import type { Metadata } from "next";
import JoinUsPageContent from "@/components/JoinUsPageContent";
import { getSiteImages } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Join Our Team | Shear Madness Hoboken",
  description:
    "Join the Shear Madness family in Hoboken, NJ. We're looking for passionate, detail-driven stylists to grow alongside Oscar Victor and our talented team.",
};

export default async function JoinUsPage() {
  const imgs = await getSiteImages();

  return <JoinUsPageContent bgImage={imgs.join_background_image ?? undefined} />;
}
