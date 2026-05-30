"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SERVICES = [
  {
    id: 0,
    title: "Women's Services",
    preview: "Haircuts · Blowouts · Colour · Highlights · Extensions · Updos",
    href: "/services#womens",
    video: "/videos/hair-styling.mp4",
    bg: "linear-gradient(160deg, #2C2420 0%, #1A1410 100%)",
    accent: "rgba(198,167,107,0.18)",
  },
  {
    id: 1,
    title: "Men's Services",
    preview: "Cuts · Colour · Relaxer · Highlights · Eyebrow Wax",
    href: "/services#mens",
    video: "/videos/men-services.mp4",
    bg: "linear-gradient(160deg, #22201E 0%, #141210 100%)",
    accent: "rgba(210,185,155,0.14)",
  },
  {
    id: 2,
    title: "Hair Treatments",
    preview: "Keratin · Conditioning · Tandem Texture",
    href: "/services#treatments",
    video: "/videos/hair-treatments.mp4",
    bg: "linear-gradient(160deg, #1E2418 0%, #121610 100%)",
    accent: "rgba(160,185,140,0.14)",
  },
];

export default function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="services"
      style={{
        width: "100%",
        background: "#ECEAE7",
        padding: "clamp(44px, 6.5vh, 76px) clamp(24px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── FIXED BACKGROUND IMAGE ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="services-fixed-bg"
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "url('/services-koi-bg.png')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.55,
          mixBlendMode: "multiply",
        }}
      />

      {/* ── SUBTLE GRAIN ────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* ── HEADING BLOCK ────────────────────────────────────────────────── */}
        <div style={{ position: "relative" }}>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: EASE }}
          style={{ textAlign: "center", marginBottom: "clamp(24px, 3.5vh, 40px)", position: "relative", zIndex: 1 }}
        >
          {/* Eyebrow */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: "#7A5C10",
            marginBottom: 8,
          }}>
            What We Offer
          </p>

          {/* Main heading */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            color: "#556B2F",
            marginBottom: 8,
          }}>
            Our{" "}
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>Services</span>
          </h2>

          {/* Editorial statement */}
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.25rem, 2.2vw, 1.85rem)",
            fontWeight: 600,
            lineHeight: 1.45,
            letterSpacing: "0.025em",
            color: "#000",
          }}>
            <span>Built on </span>
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>craft.</span>
            <span style={{ margin: "0 0.35em" }} />
            <span>Refined with </span>
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>time.</span>
            <span style={{ margin: "0 0.35em" }} />
            <span>Styled with </span>
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>purpose.</span>
          </p>

          {/* Gold dot divider */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginTop: 16,
          }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>
        </div>{/* end heading wrapper */}

        {/* ── CARDS ────────────────────────────────────────────────────────── */}
        <div
          id="services-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(16px, 2.5vw, 28px)",
          }}
        >
          {SERVICES.map((svc, i) => (
            <ServiceCard key={svc.id} svc={svc} index={i} inView={inView} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          #services-grid { grid-template-columns: 1fr !important; }
        }
        /* iOS Safari: background-attachment:fixed is unsupported — fall back to scroll */
        @supports (-webkit-touch-callout: none) {
          #services .services-fixed-bg {
            background-attachment: scroll !important;
            background-size: cover !important;
            background-position: center top !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── SERVICE CARD ──────────────────────────────────────────────────────────────
function ServiceCard({
  svc,
  index,
  inView,
}: {
  svc: typeof SERVICES[number];
  index: number;
  inView: boolean;
}) {
  return (
    <a href={svc.href} style={{ textDecoration: "none", display: "block" }}>
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, ease: EASE, delay: 0.15 + index * 0.13 }}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.40, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        aspectRatio: "3/2.8",
        cursor: "pointer",
        boxShadow: "0 12px 48px rgba(20,12,4,0.18), 0 3px 12px rgba(20,12,4,0.10)",
        background: svc.bg,
      }}
    >
      {/* ── VIDEO / PLACEHOLDER ──────────────────────────────────────────── */}
      {svc.video ? (
        <video
          autoPlay muted loop playsInline
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%",
            objectFit: "cover", display: "block",
          }}
        >
          <source src={svc.video} type="video/mp4" />
        </video>
      ) : (
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: svc.bg }} />
      )}

      {/* Dark gradient for text legibility */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
        background: "linear-gradient(to top, rgba(10,6,2,0.92) 0%, rgba(10,6,2,0.45) 45%, rgba(10,6,2,0.10) 100%)",
      }} />

      {/* Accent color bloom */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2,
        background: `radial-gradient(ellipse 70% 50% at 20% 15%, ${svc.accent} 0%, transparent 70%)`,
      }} />

      {/* Hover light sweep */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3, pointerEvents: "none",
          background: "linear-gradient(115deg, transparent 30%, rgba(255,248,235,0.07) 50%, transparent 70%)",
        }}
      />

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "clamp(20px, 3vw, 36px)",
      }}>
        {/* Editorial index number */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(2.4rem, 4vw, 3.8rem)",
          fontWeight: 300,
          lineHeight: 1,
          color: "rgba(198,167,107,0.22)",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          userSelect: "none",
        }}>
          0{index + 1}
        </p>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(1.5rem, 2.6vw, 2.2rem)",
          fontWeight: 600,
          lineHeight: 1.15,
          letterSpacing: "0.01em",
          color: "#FDFAF6",
          marginBottom: 10,
        }}>
          {svc.title}
        </h3>

        {/* Preview */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.68rem, 0.9vw, 0.78rem)",
          fontWeight: 300,
          letterSpacing: "0.08em",
          color: "rgba(253,250,246,0.62)",
          marginBottom: 22,
        }}>
          {svc.preview}
        </p>

        {/* Gold rule */}
        <div style={{
          height: 1, width: 40, marginBottom: 18,
          background: "linear-gradient(to right, rgba(198,167,107,0.8), transparent)",
        }} />

        {/* CTA */}
        <motion.span
          whileHover={{ x: 4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 500,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            color: "#7A5C10",
          }}
        >
          Explore Services
          <span style={{ fontSize: "0.8rem", lineHeight: 1 }}>→</span>
        </motion.span>
      </div>
    </motion.div>
    </a>
  );
}
