import type { Metadata } from "next";
import JoinUsPageContent from "@/components/JoinUsPageContent";

export const metadata: Metadata = {
  title: "Join Our Team | Shear Madness Hoboken",
  description:
    "Join the Shear Madness family in Hoboken, NJ. We're looking for passionate, detail-driven stylists to grow alongside Oscar Victor and our talented team.",
};

export default function JoinUsPage() {
  return <JoinUsPageContent />;
}
