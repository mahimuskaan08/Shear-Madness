"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Service = {
  name: string;
  price: string;
  descriptor?: string;
  note?: string;
  imageSrc: string;
  imageAlt: string;
  placeholderGradient: string;
  imagePosition?: string; // e.g. "center bottom" to shift focal point
};

type CategoryData = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
  services: Service[];
  bg: string;
  accentBg: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DATA
// Each service has its own named image path and elegant one-line descriptor.
// Swap in real images by placing files at the listed paths in /public/services/
// ─────────────────────────────────────────────────────────────────────────────
const PH = {
  rose:   "linear-gradient(148deg, #EDDBD8 0%, #DECAC4 100%)",
  slate:  "linear-gradient(148deg, #D8DDE4 0%, #C8CDD4 100%)",
  sage:   "linear-gradient(148deg, #DAE2D8 0%, #CACEC6 100%)",
  blush:  "linear-gradient(148deg, #EAD8E8 0%, #D8C6D4 100%)",
};

const WOMENS: Service[] = [
  { name: "Haircut",                     price: "$100",             descriptor: "Precision cut tailored to your features",            imageSrc: "/services/women-haircut.jpg",                imageAlt: "Women's haircut",                placeholderGradient: PH.rose  },
  { name: "Girl Child Cut",              price: "$50",              descriptor: "Gentle styling designed for young clients",           imageSrc: "/services/women-girl-child-cut.jpg",         imageAlt: "Girl child haircut",             placeholderGradient: PH.rose,  imagePosition: "center" },
  { name: "Blowout",                     price: "$50",              descriptor: "Smooth, polished finish with lasting movement",       imageSrc: "/services/women-blowout.jpg",                imageAlt: "Blowout styling",                placeholderGradient: PH.rose  },
  { name: "Eyebrow Wax",                 price: "$15",              descriptor: "Clean shaping and soft brow definition",             imageSrc: "/services/women-eyebrow-wax.jpg",            imageAlt: "Eyebrow waxing",                 placeholderGradient: PH.rose,  imagePosition: "center" },
  { name: "Updo",                        price: "$100",             descriptor: "Elegant upswept styles for any occasion",            imageSrc: "/services/women-updo.jpg",                   imageAlt: "Hair updo",                      placeholderGradient: PH.rose,  imagePosition: "center top" },
  { name: "Single Process Colour",       price: "$100",             descriptor: "Rich, even tone from root to tip",                   imageSrc: "/services/women-single-process-colour.jpg",  imageAlt: "Single process colour",          placeholderGradient: PH.rose  },
  { name: "Highlights Panel",            price: "$125",             descriptor: "Dimensional luminosity through targeted panels",     imageSrc: "/services/women-highlights-panel.jpg",       imageAlt: "Highlights panel",               placeholderGradient: PH.rose,  imagePosition: "center" },
  { name: "Highlights: Partial / Full",  price: "$160 – $210",      descriptor: "Brightening color that frames the face or all-over radiance with natural-looking depth", imageSrc: "/services/women-highlights-partial.jpg", imageAlt: "Highlights partial or full", placeholderGradient: PH.rose  },
  { name: "Color Correction",            price: "By Consultation",  descriptor: "Expert restoration to your ideal shade",             imageSrc: "/services/women-color-correction.jpg",       imageAlt: "Color correction",               placeholderGradient: PH.rose,  imagePosition: "center bottom" },
  { name: "Color Glazing",               price: "$75",              descriptor: "Glossy tonal refresh with luminous finish",          imageSrc: "/services/women-color-glazing.jpg",          imageAlt: "Color glazing",                  placeholderGradient: PH.rose  },
  { name: "Permanent Wave",              price: "$150",             descriptor: "Long-lasting texture and effortless body",           imageSrc: "/services/women-permanent-wave.jpg",         imageAlt: "Permanent wave",                 placeholderGradient: PH.rose  },
  { name: "Extensions",                  price: "By Consultation",  descriptor: "Seamless length and volume, fully customized",       imageSrc: "/services/women-extensions.jpg",             imageAlt: "Hair extensions",                placeholderGradient: PH.rose,  imagePosition: "center top" },
];

const MENS: Service[] = [
  { name: "Hair Cut",       price: "$45 – $50",    descriptor: "Clean, modern cut with precise technique",         imageSrc: "/services/men-hair-cut.png",       imageAlt: "Men's haircut",          placeholderGradient: PH.slate, imagePosition: "center top" },
  { name: "Boy Child Cut",  price: "$35",          descriptor: "Comfortable styling tailored for young boys",      imageSrc: "/services/men-boy-child-cut.jpg",  imageAlt: "Boy child haircut",      placeholderGradient: PH.slate, imagePosition: "center top" },
  { name: "Eyebrow Wax",    price: "$15",          descriptor: "Groomed shaping for a polished, defined look",     imageSrc: "/services/men-eyebrow-wax.jpg",    imageAlt: "Men's eyebrow wax",      placeholderGradient: PH.slate },
  { name: "Single Process", price: "$65",          descriptor: "Even color refresh, natural or bold",              imageSrc: "/services/men-single-process.jpg", imageAlt: "Men's single process",   placeholderGradient: PH.slate },
  { name: "Relaxer",        price: "$125",         descriptor: "Smooth, manageable texture with lasting results",  imageSrc: "/services/men-relaxer.jpg",        imageAlt: "Hair relaxer",           placeholderGradient: PH.slate },
  { name: "Highlights",     price: "By Consultation", descriptor: "Subtle dimension and sun-kissed tone",          imageSrc: "/services/men-highlights.png",     imageAlt: "Men's highlights",       placeholderGradient: PH.slate, imagePosition: "center" },
];

const TREATMENTS: Service[] = [
  { name: "Intensive Conditioning Treatment", price: "$40", descriptor: "Deep nourishment restoring softness and strength", imageSrc: "/services/treatments-intensive-conditioning.png", imageAlt: "Intensive conditioning treatment", placeholderGradient: PH.sage  },
  { name: "Tandem Texture Treatment",         price: "$50",              descriptor: "Dual-action repair for definition and smoothness", imageSrc: "/services/treatments-tandem-texture.png",    imageAlt: "Tandem texture treatment",         placeholderGradient: PH.sage  },
  { name: "Brazilian Keratin Treatment",      price: "By Consultation",  descriptor: "Frizz-free smoothing for lasting silk",             imageSrc: "/services/treatments-keratin-treatment.jpg", imageAlt: "Brazilian keratin treatment",      placeholderGradient: PH.sage,  imagePosition: "center top" },
];

const CATEGORIES: CategoryData[] = [
  { id: "womens",     eyebrow: "For Her",          title: "Women's Services",  description: "Thoughtfully tailored cuts, color, and styling services designed to enhance your natural beauty with precision and artistry.", note: "Color services include Toner/Glaze & Blowout ($95 value)", services: WOMENS,     bg: "transparent", accentBg: "transparent" },
  { id: "mens",       eyebrow: "For Him",          title: "Men's Services",    description: "Clean, polished grooming and color services crafted with comfort, detail, and modern style in mind.",                           services: MENS,       bg: "transparent", accentBg: "transparent" },
  { id: "treatments", eyebrow: "Restore & Refine", title: "Hair Treatments",   description: "Restorative treatments designed to nourish, strengthen, and refine the hair from root to finish.",                             services: TREATMENTS, bg: "transparent", accentBg: "transparent" },
];

const NOTES = [
  "Complimentary bang trim and clean-up services available between haircuts.",
  "We also offer facial waxing as well as lash and brow tinting.",
  "All services are guaranteed.",
  "Prices may vary.",
];

// ─────────────────────────────────────────────────────────────────────────────
// BRAND MARQUEE DATA
// Each brand has its own typographic style to feel distinct and premium.
// ─────────────────────────────────────────────────────────────────────────────
const BRANDS = [
  {
    name: "Wella Professionals",
    src: "/logos/wella.png",
    sub: "Since 1880",
    font: "'Cormorant Garamond', Georgia, serif",
    weight: 300,
    spacing: "0.22em",
    style: "normal" as const,
    size: "clamp(0.62rem, 0.95vw, 0.78rem)",
  },
  {
    name: "Sebastian",
    src: "/logos/sebastian.png",
    sub: "Professional",
    font: "'Inter', sans-serif",
    weight: 200,
    spacing: "0.32em",
    style: "normal" as const,
    size: "clamp(0.58rem, 0.85vw, 0.72rem)",
  },
  {
    name: "Nioxin",
    src: "/logos/nioxin.png",
    sub: "Scalp + Hair",
    font: "'Inter', sans-serif",
    weight: 600,
    spacing: "0.28em",
    style: "normal" as const,
    size: "clamp(0.56rem, 0.80vw, 0.68rem)",
  },
  {
    name: "Tea Tree",
    src: "/logos/tea-tree.png",
    sub: "Special",
    font: "'Cormorant Garamond', Georgia, serif",
    weight: 500,
    spacing: "0.18em",
    style: "italic" as const,
    size: "clamp(0.64rem, 0.95vw, 0.80rem)",
  },
  {
    name: "Kevin.Murphy",
    src: "/logos/kevin-murphy.png",
    sub: "Sustainable Beauty",
    font: "'Inter', sans-serif",
    weight: 300,
    spacing: "0.20em",
    style: "normal" as const,
    size: "clamp(0.60rem, 0.85vw, 0.72rem)",
  },
  {
    name: "d:fi",
    src: "/logos/dfi.png",
    sub: "Hair Care",
    font: "'Cormorant Garamond', Georgia, serif",
    weight: 400,
    spacing: "0.28em",
    style: "italic" as const,
    size: "clamp(0.76rem, 1.1vw, 0.96rem)",
  },
  {
    name: "Marcia Teixeira",
    src: "/logos/marcia.png",
    sub: "Brazilian Keratin",
    font: "'Cormorant Garamond', Georgia, serif",
    weight: 300,
    spacing: "0.14em",
    style: "normal" as const,
    size: "clamp(0.62rem, 0.90vw, 0.76rem)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HERO PETALS
// ─────────────────────────────────────────────────────────────────────────────
const PETALS = [
  { id: 0, left:  6, size: 11, delay:   0, dur: 20, rot:  22, drift:  28 },
  { id: 1, left: 20, size:  9, delay:  -8, dur: 25, rot: 140, drift: -22 },
  { id: 2, left: 45, size: 12, delay:  -5, dur: 18, rot:  68, drift:  40 },
  { id: 3, left: 66, size: 10, delay: -15, dur: 22, rot: 210, drift: -32 },
  { id: 4, left: 83, size: 11, delay:  -3, dur: 19, rot:  85, drift:  24 },
  { id: 5, left: 32, size:  9, delay: -11, dur: 24, rot: 295, drift: -18 },
  { id: 6, left: 74, size: 10, delay:  -7, dur: 21, rot: 155, drift:  36 },
];
const PETAL_COLORS = [
  "rgba(222,120,145,0.80)", "rgba(235,145,165,0.80)",
  "rgba(210,110,135,0.80)", "rgba(245,160,178,0.80)",
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  /* iOS Safari does not support background-attachment: fixed — fallback to scroll */
  /* Also adjust sizing so image fits neatly on all screen sizes               */
  @media (max-width: 1024px) {
    .svc-page-bg {
      background-attachment: scroll !important;
      background-size: contain !important;
      background-position: center top !important;
      filter: brightness(1.12) contrast(0.88) blur(2px) !important;
    }
  }
  @media (max-width: 640px) {
    .svc-page-bg {
      background-size: 100% auto !important;
      background-position: top center !important;
    }
  }

  /* ── CRANE ANIMATION ────────────────────────────────── */
  @keyframes crane-walk {
    0%   { transform: translateX(-120px); }
    100% { transform: translateX(calc(100vw + 120px)); }
  }
  @keyframes crane-bob {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25%       { transform: translateY(-4px) rotate(1deg); }
    75%       { transform: translateY(-2px) rotate(-0.5deg); }
  }
  @keyframes crane-head {
    0%, 100% { transform: rotate(0deg); }
    30%       { transform: rotate(8deg); }
    60%       { transform: rotate(-4deg); }
  }
  @keyframes crane-leg-l {
    0%, 100% { transform: rotate(0deg); }
    50%       { transform: rotate(22deg); }
  }
  @keyframes crane-leg-r {
    0%, 100% { transform: rotate(22deg); }
    50%       { transform: rotate(0deg); }
  }
  @keyframes mist-drift {
    0%   { opacity: 0; transform: translateX(0) scaleX(1); }
    40%  { opacity: 0.22; }
    100% { opacity: 0; transform: translateX(28px) scaleX(1.4); }
  }
  .crane-wrap {
    position: absolute;
    top: 18px;
    left: 0;
    width: 100%;
    height: 80px;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
  }
  .crane-mover {
    position: absolute;
    top: 0; left: 0;
    animation: crane-walk 32s linear infinite;
    will-change: transform;
  }
  .crane-body-wrap {
    animation: crane-bob 1.8s ease-in-out infinite;
    will-change: transform;
  }
  @media (max-width: 640px) {
    .crane-wrap { display: none; }
  }

  /* ── SERVICE IMAGE CARD ─────────────────────────────── */
  .svc-img-card {
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
  }
  .svc-img-card:hover {
    transform: translateY(-5px) scale(1.012);
  }
  .svc-img-card .svc-card-img img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 1.0s cubic-bezier(0.22,1,0.36,1),
                filter 0.35s ease;
  }
  .svc-img-card:hover .svc-card-img img {
    transform: scale(1.06);
    filter: brightness(1.06);
  }

  /* ── CARD GRID ──────────────────────────────────────── */
  .svc-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(14px, 1.8vw, 22px);
  }
  @media (max-width: 1024px) { .svc-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 560px)  { .svc-grid { grid-template-columns: 1fr; } }

  /* ── NOTES GRID ─────────────────────────────────────── */
  .notes-grid {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: clamp(14px,1.8vw,22px);
  }
  @media (max-width: 900px)  { .notes-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 480px)  { .notes-grid { grid-template-columns: 1fr; } }

  /* ── BRAND MARQUEE ──────────────────────────────────── */
  @keyframes svc-marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .svc-marquee-track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: svc-marquee 38s linear infinite;
    will-change: transform;
  }
  .svc-marquee-track:hover {
    animation-play-state: paused;
  }
  .svc-brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0 clamp(18px, 2.6vw, 36px);
    height: 44px;
    opacity: 0.48;
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease;
    cursor: default;
    white-space: nowrap;
    filter: brightness(10);
  }
  @media (max-width: 640px) {
    .svc-brand-item { height: 36px; padding: 0 clamp(12px, 2vw, 22px); }
  }
  .svc-brand-item:hover {
    opacity: 0.95;
    transform: scale(1.05);
    filter: brightness(10) drop-shadow(0 0 8px rgba(198,167,107,0.35));
  }
  /* Dot divider between brands */
  .svc-brand-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.28);
    flex-shrink: 0;
    align-self: center;
  }

  /* ── HERO PETAL KEYFRAMES ───────────────────────────── */
  ${PETALS.map(({ id, rot, drift }) => `
  @keyframes svc-petal-${id} {
    0%   { transform: translateY(-60px) translateX(0) rotate(${rot}deg); opacity:0; }
    8%   { opacity:1; }
    88%  { opacity:0.75; }
    100% { transform: translateY(calc(100vh+60px)) translateX(${drift}px) rotate(${rot+480}deg); opacity:0; }
  }`).join("")}
`;

// ─────────────────────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function PetalSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={Math.round(size*1.3)} viewBox="0 0 20 26" fill="none" style={{ display:"block" }}>
      <path d="M10,1 C13.2,0.5 17.2,0 17.2,0 C15.6,4.2 17.8,9.4 16.8,14.2 C15.8,19 13.2,23.8 10,25.8 C6.8,23.8 4.2,19 3.2,14.2 C2.2,9.4 4.4,4.2 2.8,0 C2.8,0 6.8,0.5 10,1 Z" fill={color}/>
      <ellipse cx="10" cy="12" rx="3.5" ry="6.5" fill="rgba(255,230,235,0.18)"/>
      <path d="M10,3 Q10,14 10,25" stroke="rgba(180,100,120,0.20)" strokeWidth="0.6" fill="none"/>
    </svg>
  );
}


function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity:0, y:22 }} animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:1.0, ease:EASE, delay }}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE IMAGE CARD
// ─────────────────────────────────────────────────────────────────────────────
const CARD_THEMES: Record<string, { default: { bg: string; shadow: string; border: string }; hover: { bg: string; shadow: string; border: string } }> = {
  womens: {
    default: { bg: "linear-gradient(160deg, #FFF8FB 0%, #FFF3F7 100%)", shadow: "0 2px 12px rgba(232,183,197,0.18)", border: "rgba(232,183,197,0.22)" },
    hover:   { bg: "linear-gradient(160deg, #FFF4F8 0%, #FFF0F5 100%)", shadow: "0 16px 40px rgba(232,183,197,0.30), 0 4px 12px rgba(26,18,8,0.05)", border: "rgba(232,183,197,0.42)" },
  },
  mens: {
    default: { bg: "linear-gradient(160deg, #FBF7F2 0%, #F8F2EA 100%)", shadow: "0 2px 12px rgba(210,190,170,0.18)", border: "rgba(210,190,170,0.22)" },
    hover:   { bg: "linear-gradient(160deg, #F8F3EC 0%, #F5EEE5 100%)", shadow: "0 16px 40px rgba(210,190,170,0.30), 0 4px 12px rgba(26,18,8,0.05)", border: "rgba(210,190,170,0.40)" },
  },
  bridal: {
    default: { bg: "linear-gradient(160deg, #FFFFFF 0%, #FFFDFC 100%)", shadow: "0 2px 12px rgba(241,232,228,0.20)", border: "rgba(241,232,228,0.32)" },
    hover:   { bg: "linear-gradient(160deg, #FFFBF9 0%, #FFF9F7 100%)", shadow: "0 16px 40px rgba(241,232,228,0.36), 0 4px 12px rgba(26,18,8,0.05)", border: "rgba(241,232,228,0.55)" },
  },
  treatments: {
    default: { bg: "linear-gradient(160deg, #FAFDFB 0%, #F4FAF6 100%)", shadow: "0 2px 12px rgba(191,216,204,0.18)", border: "rgba(191,216,204,0.22)" },
    hover:   { bg: "linear-gradient(160deg, #F6FBF8 0%, #F1F7F3 100%)", shadow: "0 16px 40px rgba(191,216,204,0.30), 0 4px 12px rgba(26,18,8,0.05)", border: "rgba(191,216,204,0.40)" },
  },
};

function ServiceCard({ svc, catId }: { svc: Service; catId: string }) {
  const [hovered, setHovered] = useState(false);
  const isCons = svc.price === "By Consultation";
  const theme = CARD_THEMES[catId] ?? CARD_THEMES.womens;
  const t = hovered ? theme.hover : theme.default;

  return (
    <div
      className="svc-img-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.bg,
        boxShadow:  t.shadow,
        border:     `1px solid ${t.border}`,
        transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* ── IMAGE ─────────────────────────────────────────────────────── */}
      <div className="svc-card-img" style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden" }}>
        {/* Placeholder always rendered underneath */}
        <div style={{
          position:"absolute", inset:0,
          background: svc.placeholderGradient,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:8,
        }}>
          <div style={{ width:28, height:1, background:"rgba(198,167,107,0.40)" }}/>
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"0.68rem", fontStyle:"italic", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(26,18,8,0.32)" }}>
            {svc.imageAlt}
          </span>
          <div style={{ width:28, height:1, background:"rgba(198,167,107,0.40)" }}/>
        </div>
        {/* Real image overlaid — hides if src 404s */}
        <img
          src={svc.imageSrc}
          alt={svc.imageAlt}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition: svc.imagePosition ?? "center top" }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────── */}
      <div style={{ padding:"clamp(14px,1.8vh,20px) clamp(16px,1.6vw,22px)", display:"flex", flexDirection:"column", gap:6 }}>
        <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1.05rem,1.4vw,1.25rem)", fontWeight:600, lineHeight:1.2, color:"#556B2F", letterSpacing:"0.01em" }}>
          {svc.name}
        </h3>
        {svc.descriptor && (
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(0.82rem,0.85vw,0.88rem)", fontWeight:400, color:"#111111", letterSpacing:"0.012em", lineHeight:1.70 }}>
            {svc.descriptor}
          </p>
        )}
        {svc.note && (
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(0.78rem,0.90vw,0.86rem)", fontStyle:"italic", color:"rgba(198,167,107,0.80)", lineHeight:1.5, marginTop:2 }}>
            {svc.note}
          </p>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6, paddingTop:10, borderTop:"1px solid rgba(198,167,107,0.16)" }}>
          <span style={{
            fontFamily: isCons ? "'Cormorant Garamond',Georgia,serif" : "'Inter',sans-serif",
            fontSize:   isCons ? "clamp(0.92rem,1.05vw,1.0rem)" : "clamp(0.80rem,0.95vw,0.88rem)",
            fontWeight: isCons ? 400 : 600,
            fontStyle:  isCons ? "italic" : "normal",
            color:      isCons ? "#C6A76B" : "#1A1208",
            letterSpacing: isCons ? "0.01em" : "0.02em",
          }}>
            {svc.price}
          </span>
          <div style={{ width:18, height:1, background:"linear-gradient(to right, rgba(198,167,107,0.40), transparent)" }}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SECTION
// ─────────────────────────────────────────────────────────────────────────────
function CategorySection({ cat }: { cat: CategoryData }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id={cat.id} style={{ background: "transparent", padding:`${cat.id === "womens" ? "clamp(4px,0.45vh,6px)" : "clamp(7px,0.9vh,11px)"} clamp(24px,7vw,96px)`, position:"relative" }}>


      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", flexDirection:"column", gap:"clamp(4px,0.5vh,6px)" }}>

        {/* ── CATEGORY HEADING ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:22 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:1.0, ease:EASE }}
          style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>

          {/* Left: eyebrow + title + description */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1, minWidth:0 }}>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.60rem", fontWeight:500, letterSpacing:"0.34em", textTransform:"uppercase", color:"#7A5C10" }}>
              {cat.eyebrow}
            </p>
            <div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(2.2rem,4vw,3.4rem)", fontWeight:600, lineHeight:1.1, letterSpacing:"0.01em", color:"#556B2F", marginBottom:14 }}>
                {cat.title}
              </h2>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#C6A76B", flexShrink:0 }}/>
                <div style={{ height:1, width:56, background:"linear-gradient(to right, rgba(198,167,107,0.60), transparent)" }}/>
              </div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(1.0rem,1.05vw,1.06rem)", fontWeight:400, lineHeight:1.78, color:"#111111", letterSpacing:"0.012em", maxWidth:580, textShadow:"0 1px 2px rgba(255,255,255,0.35)" }}>
                {cat.description}
              </p>
            </div>
          </div>

          {/* Right: note callout */}
          {cat.note && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, flexShrink:0, alignSelf:"center", textAlign:"right" }}>
              <span style={{ color:"#7A5C10", fontSize:"0.60rem", flexShrink:0, marginTop:1 }}>✦</span>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"clamp(0.80rem,0.95vw,0.90rem)", fontWeight:700, fontStyle:"normal", color:"#0A0A0A", letterSpacing:"0.01em", lineHeight:1.55 }}>
                {cat.note}
              </p>
            </div>
          )}
        </motion.div>

        {/* ── SERVICE CARDS GRID ──────────────────────────────────────── */}
        <div className="svc-grid">
          {cat.services.map((svc, i) => (
            <FadeIn key={svc.name} delay={0.06 * i}>
              <ServiceCard svc={svc} catId={cat.id} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES SECTION
// ─────────────────────────────────────────────────────────────────────────────
function NotesSection() {
  return (
    <section style={{ background:"transparent", padding:"clamp(3px,0.35vh,4px) clamp(24px,7vw,96px)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <FadeIn style={{ textAlign:"center", marginBottom:"clamp(16px,2vh,24px)" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.58rem", fontWeight:500, letterSpacing:"0.34em", textTransform:"uppercase", color:"#7A5C10", marginBottom:6 }}>
            Good to Know
          </p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1.4rem,2.2vw,2.0rem)", fontWeight:600, color:"#556B2F", letterSpacing:"0.01em" }}>
            Service Notes
          </h2>
        </FadeIn>
        <div className="notes-grid">
          {NOTES.map((text, i) => (
            <FadeIn key={i} delay={0.08 * i}>
              <div style={{ background:"linear-gradient(160deg, #FBF7F2 0%, #F8F2EA 100%)", border:"1px solid rgba(210,190,170,0.22)", borderRadius:6, boxShadow:"0 2px 14px rgba(210,190,170,0.12)", padding:"clamp(10px,1.4vh,16px) clamp(12px,1.2vw,18px)", height:"100%", display:"flex", flexDirection:"column", gap:6 }}>
                <span style={{ fontSize:"0.52rem", color:"#7A5C10" }}>✦</span>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(0.92rem,0.95vw,1.0rem)", fontWeight:400, lineHeight:1.72, color:"#111111", letterSpacing:"0.01em" }}>
                  {text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// BRAND MARQUEE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function BrandMarquee() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      {/* Edge fades */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 2,
        background: "linear-gradient(to right, rgba(15,10,6,0.90) 0%, transparent 14%, transparent 86%, rgba(15,10,6,0.90) 100%)",
      }} />

      <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.22), transparent)", marginBottom: 8 }} />

      <div style={{ overflow: "hidden" }}>
        <div className="svc-marquee-track">
          {doubled.map((brand, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div className="svc-brand-item">
                <img
                  src={brand.src}
                  alt={brand.name}
                  style={{
                    height: "clamp(28px, 3.2vw, 42px)",
                    width: "auto",
                    maxWidth: "clamp(80px, 10vw, 130px)",
                    objectFit: "contain",
                    display: "block",
                    filter: "brightness(0) saturate(0)",
                    opacity: 0.85,
                    transition: "opacity 0.4s ease",
                  }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="svc-brand-dot" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.22), transparent)", marginTop: 8 }} />

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ position:"relative", minHeight:"50svh", display:"flex", flexDirection:"column", justifyContent:"center" }}>

      {/* Petals */}
      <div aria-hidden style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:1 }}>
        {PETALS.map(p => (
          <div key={p.id} style={{ position:"absolute", left:`${p.left}%`, top:0, animation:`svc-petal-${p.id} ${p.dur}s ${p.delay}s linear infinite`, willChange:"transform,opacity" }}>
            <PetalSVG size={p.size} color={PETAL_COLORS[p.id % PETAL_COLORS.length]}/>
          </div>
        ))}
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1280, margin:"0 auto", width:"100%", position:"relative", zIndex:2, padding:"clamp(72px,9vh,80px) clamp(24px,7vw,96px) clamp(3px,0.4vh,5px)" }}>
        <div style={{ textAlign:"center", maxWidth:700, margin:"0 auto" }}>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, ease:EASE, delay:0.2 }}
            style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.60rem", fontWeight:500, letterSpacing:"0.40em", textTransform:"uppercase", color:"#7A5C10", marginBottom:14 }}>
            Our Services
          </motion.p>

          <motion.h1 initial={{ opacity:0, y:26 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.1, ease:EASE, delay:0.34 }}
            style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(2.8rem,6vw,5.0rem)", fontWeight:600, lineHeight:1.0, letterSpacing:"0.01em", color:"#556B2F", marginBottom:18 }}>
            Salon <em>Services</em>
          </motion.h1>

          <motion.div initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }} transition={{ duration:1.0, ease:EASE, delay:0.50 }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
            <div style={{ height:1, width:52, background:"linear-gradient(to right,transparent,rgba(198,167,107,0.70))" }}/>
            <div style={{ width:4, height:4, borderRadius:"50%", background:"#C6A76B", opacity:0.90 }}/>
            <div style={{ height:1, width:52, background:"linear-gradient(to left,transparent,rgba(198,167,107,0.70))" }}/>
          </motion.div>

          <motion.p initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.0, ease:EASE, delay:0.62 }}
            style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(1.05rem,1.5vw,1.25rem)", fontStyle:"italic", fontWeight:400, lineHeight:1.75, color:"#111111", letterSpacing:"0.01em", textShadow:"0 1px 2px rgba(255,255,255,0.35)" }}>
            Tailored beauty, precision styling, and elevated care for every occasion.
          </motion.p>

          {/* Book CTA */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.0, ease:EASE, delay:0.78 }}
            style={{ marginTop:28 }}>
            <a href="/booking"
              style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#0A0A0A", background:"linear-gradient(135deg,#C9A96E 0%,#B8935A 55%,#C4A96A 100%)", padding:"13px 38px", borderRadius:100, boxShadow:"0 4px 22px rgba(198,167,107,0.45)", transition:"box-shadow 0.4s ease,transform 0.4s ease", textDecoration:"none" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow="0 8px 32px rgba(198,167,107,0.65)"; el.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow="0 4px 22px rgba(198,167,107,0.45)"; el.style.transform="translateY(0)"; }}
            >
              Book Now
            </a>
          </motion.div>

        </div>
      </div>

    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ServicesPageContent({ bgImage }: { bgImage?: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <CustomCursor />
      <Navbar />
      <main>
        {/* ── ONE unified background wrapper — hero + all sections blend seamlessly */}
        <div style={{ position: "relative" }}>

          {/* Layer 0: base cream */}
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#F5F2EB", zIndex: 0 }} />

          {/* Layer 1: fixed bg image — covers entire page from top */}
          <div aria-hidden className="svc-page-bg" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url('${bgImage ?? "/services-page-bg.jpg"}')`,
            backgroundAttachment: "fixed",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            opacity: 0.5,
            filter: "brightness(1.12) contrast(0.88) blur(4px)",
            zIndex: 1,
          }} />

          {/* Layer 2: very light cream tint */}
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(245,242,235,0.15)", pointerEvents: "none", zIndex: 2 }} />

          {/* Layer 3: all content — hero flows straight into sections, no seam */}
          <div style={{ position: "relative", zIndex: 3 }}>
            <HeroSection />
            {CATEGORIES.map(cat => <CategorySection key={cat.id} cat={cat} />)}
            <NotesSection />
          </div>
        </div>

      </main>

      {/* ── BRAND MARQUEE — bottom of page, before footer ──────────── */}
      <div style={{ background:"#F5F2EB", paddingTop:"clamp(16px,2vh,24px)", paddingBottom:"clamp(16px,2vh,24px)" }}>
        <BrandMarquee />
      </div>

      <Footer />
    </>
  );
}
