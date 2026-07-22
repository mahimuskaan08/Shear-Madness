"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BG = "#ECEAE7";

const DEFAULT_CONTACT_HOURS = [
  { days: "Tue – Thu", time: "10:00 am – 9:00 pm" },
  { days: "Fri",       time: "10:00 am – 8:00 pm" },
  { days: "Sat",       time: "10:00 am – 6:00 pm" },
  { days: "Sun – Mon", time: "Closed"              },
];


const STYLES = `
/* ── RIPPLE ANIMATION ───────────────────────────────────────────── */
@keyframes koi-ripple {
  0%   { transform: translate(-50%,-50%) scale(0.15); opacity: 0.70; }
  75%  { opacity: 0.22; }
  100% { transform: translate(-50%,-50%) scale(2.2);  opacity: 0;    }
}
.koi-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(160,132,78,0.50);
  box-shadow: 0 0 8px rgba(160,132,78,0.18);
  pointer-events: none;
  will-change: transform, opacity;
}
.koi-ring-1 {
  width: 260px; height: 260px;
  top: 55%; left: 46%;
  animation: koi-ripple 10s ease-out 0s infinite;
}
.koi-ring-2 {
  width: 200px; height: 200px;
  top: 40%; left: 56%;
  animation: koi-ripple 13s ease-out 4s infinite;
}
.koi-ring-3 {
  width: 150px; height: 150px;
  top: 62%; left: 38%;
  animation: koi-ripple 8s ease-out 7.5s infinite;
}
.koi-ring-4 {
  width: 300px; height: 300px;
  top: 48%; left: 52%;
  animation: koi-ripple 16s ease-out 2s infinite;
}
/* ── Per-block ───────────────────────────────────────────────────── */
.contact-info-block-box {
  background: none;
  border-radius: 14px;
  padding: clamp(14px, 2.2vw, 20px) clamp(16px, 2.5vw, 24px);
  border: none;
}
/* ── RESPONSIVE ─────────────────────────────────────────────────── */
@media (min-width: 601px) and (max-width: 1100px) {
  /* iPad: stack below info panel */
  #contact-grid { flex-direction: column !important; }
  #contact-info-panel { max-width: 100% !important; }
  /* iPad: full image visible, no cropping */
  #contact-bg-img { object-position: center center !important; object-fit: contain !important; }
}
/* Tablet + mobile: keep hours row inside the viewport, right-aligned times */
@media (max-width: 900px) {
  #contact-info-panel { max-width: 100% !important; width: 100% !important; }
  .contact-hours-row {
    flex-wrap: nowrap !important;
    gap: 8px !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100% !important;
    min-width: 0 !important;
  }
  .contact-hours-day {
    flex: 0 0 auto !important;
  }
  .contact-hours-time {
    text-align: right !important;
    letter-spacing: 0.04em !important;
    padding: 2px 8px !important;
    margin-left: auto !important;
    flex: 0 1 auto !important;
    min-width: 0 !important;
  }
}
@media (max-width: 600px) {
  #contact-grid { flex-direction: column !important; }
  .contact-hours-time { font-size: 1.15rem !important; }
  .contact-hours-day  { font-size: 1.35rem !important; }
  /* Give the hours block a bit more breathing room on narrow screens */
  .contact-info-block-box { padding-left: 10px !important; padding-right: 10px !important; }
}
/* ── Mobile background image swap ── */
.contact-bg-mobile { display: none; }
@media (max-width: 767px) {
  #contact-bg-img     { display: none !important; }
  .contact-bg-mobile  { display: block !important; }
  .contact-info-block-box {
    background: none !important;
    border: none !important;
  }
  /* Larger text on mobile */
  .contact-info-line { font-size: 1.7rem !important; }
  .contact-info-line-large { font-size: 2.2rem !important; }
  .contact-section-divider {
    background: rgba(0,0,0,0.15) !important;
  }
}
`;

export default function ContactPage({
  bgImage,
  bgImageMobile,
  phone,
  email,
  addressLine1,
  cityStateZip,
  hoursTueThu,
  hoursFri,
  hoursSat,
  hoursSunMon,
  mapsUrl,
}: {
  bgImage?:        string;
  bgImageMobile?:  string;
  phone?:          string;
  email?:          string;
  addressLine1?:   string;
  cityStateZip?:   string;
  hoursTueThu?:    string;
  hoursFri?:       string;
  hoursSat?:       string;
  hoursSunMon?:    string;
  mapsUrl?:        string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const displayPhone        = phone        || "(201) 222-2102";
  const displayEmail        = email        || "info@shearmadnesshoboken.com";
  const displayAddr1        = addressLine1 || "80 Park Ave";
  const displayCityStateZip = cityStateZip || "Hoboken, NJ 07030";
  const displayMapsUrl      = mapsUrl      || "https://www.google.com/maps/dir/?api=1&destination=80+Park+Ave,+Hoboken,+NJ+07030";
  const telHref             = `tel:+1${displayPhone.replace(/\D/g, "")}`;
  const HOURS = [
    { days: "Tue – Thu", time: hoursTueThu ?? DEFAULT_CONTACT_HOURS[0].time },
    { days: "Fri",       time: hoursFri    ?? DEFAULT_CONTACT_HOURS[1].time },
    { days: "Sat",       time: hoursSat    ?? DEFAULT_CONTACT_HOURS[2].time },
    { days: "Sun – Mon", time: hoursSunMon ?? DEFAULT_CONTACT_HOURS[3].time },
  ];

  return (
    <section
      ref={ref}
      id="contact"
      style={{
        minHeight: "auto",
        background: BG,
        position: "relative",
        overflow: "hidden",
        paddingTop: "calc(var(--navbar-h) + clamp(20px, 2.8vh, 36px))",
        paddingInline: "clamp(24px, 7vw, 96px)",
        paddingBottom: "clamp(10px, 1.2vh, 15px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── KOI — pinned to right side of section ───────────────────────────── */}
      <img
        src="/contact-koi.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          right: "-4%",
          transform: "translateY(-50%)",
          width: "38%",
          height: "auto",
          opacity: 0.68,
          filter: "brightness(1.06) contrast(0.90) saturate(0.90)",
          WebkitMaskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, black 25%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, black 25%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── WATER BACKGROUND ────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        {/* Desktop / tablet background */}
        <img
          id="contact-bg-img"
          src={bgImage ?? "/contact-koi-bg.png"}
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            width: "100%", height: "100%",
            objectFit: "contain", objectPosition: "center center",
            opacity: 0.90,
          }}
        />
        {/* Mobile-only background */}
        <img
          className="contact-bg-mobile"
          src={bgImageMobile ?? "/contact-koi-bg-mobile.png"}
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            width: "100%", height: "100%",
            objectFit: "contain", objectPosition: "center center",
            opacity: 0.90,
          }}
        />
      </div>

      {/* ── SUBTLE GOLD GLOW (page-level only) ───────────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-8%",
          width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(198,167,107,0.09) 0%, transparent 65%)",
          filter: "blur(48px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-12%", right: "-10%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(circle, rgba(198,167,107,0.07) 0%, transparent 65%)",
          filter: "blur(56px)",
        }} />
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── HEADING ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, ease: EASE }}
          style={{ marginBottom: "clamp(36px, 5vh, 56px)" }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.4rem, 3.8vw, 3.25rem)",
            fontWeight: 600, lineHeight: 1.0,
            letterSpacing: "0.01em", color: "#556B2F", marginBottom: 6,
            display: "inline-block",
            background: "rgba(255,252,245,0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 6,
            padding: "2px 12px",
          }}>
            Hours and <em>Location</em>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>

        {/* ── INFO + MAP LAYOUT ────────────────────────────────────────────────── */}
        <div id="contact-grid" style={{
          display: "flex",
          gap: "clamp(40px, 4vw, 64px)",
          alignItems: "start",
          paddingBottom: "clamp(36px, 5vh, 60px)",
        }}>

          {/* ── LEFT: KOI PANEL (Address / Hours / Contact) ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.28 }}
            id="contact-info-panel"
            style={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              maxWidth: 480,
            }}
          >

            <div style={{
              display: "flex", flexDirection: "column",
              gap: "clamp(28px, 4vh, 44px)",
              position: "relative", zIndex: 1,
            }}>

                <InfoBlock label="Address" inView={inView} delay={0.38}>
                  <InfoLine primary>{displayAddr1}</InfoLine>
                  <InfoLine>{displayCityStateZip}</InfoLine>
                </InfoBlock>

                <InfoBlock label="Hours" inView={inView} delay={0.50}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
                    {HOURS.map(({ days, time }) => (
                      <div key={days} className="contact-hours-row" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                        <span className="contact-hours-day" style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: time === "Closed" ? "clamp(1.45rem, 1.9vw, 1.7rem)" : "clamp(1.2rem, 1.6vw, 1.45rem)",
                          fontWeight: time === "Closed" ? 900 : 800,
                          color: "#1A1A1A",
                          letterSpacing: time === "Closed" ? "0.08em" : "0.01em",
                          textTransform: time === "Closed" ? "uppercase" : undefined,
                          whiteSpace: "nowrap",
                        }}>
                          {days}
                        </span>
                        <span className="contact-hours-time" style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: time === "Closed" ? "clamp(1.35rem, 1.8vw, 1.6rem)" : "clamp(1.1rem, 1.5vw, 1.3rem)",
                          fontWeight: 900,
                          color: time === "Closed" ? "rgba(0,0,0,0.55)" : "#000000",
                          letterSpacing: time === "Closed" ? "0.12em" : "0.01em",
                          textTransform: time === "Closed" ? "uppercase" : undefined,
                          textAlign: "right", whiteSpace: "nowrap",
                          background: "rgba(255,252,245,0.85)",
                          border: "1px solid rgba(0,0,0,0.22)",
                          borderRadius: 6,
                          padding: "3px 12px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        }}>
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </InfoBlock>

                <InfoBlock label="Contact" inView={inView} delay={0.62}>
                  <InfoLine primary large href={`mailto:${displayEmail}`}>{displayEmail}</InfoLine>
                  <InfoLine large href={telHref}>{displayPhone}</InfoLine>
                </InfoBlock>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.85, ease: EASE, delay: 0.76 }}
                >
                  <a
                    href={displayMapsUrl}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px", fontWeight: 600,
                      letterSpacing: "0.16em", textTransform: "uppercase",
                      color: "#FFFFFF",
                      background: "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
                      padding: "10px 26px", borderRadius: 9999,
                      boxShadow: "0 4px 18px rgba(196,169,106,0.45), inset 0 1px 0 rgba(255,255,255,0.20)",
                      transition: "all 0.40s ease",
                      textDecoration: "none", cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.boxShadow = "0 8px 24px rgba(196,169,106,0.60), inset 0 1px 0 rgba(255,255,255,0.22)";
                      el.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.boxShadow = "0 4px 18px rgba(196,169,106,0.45), inset 0 1px 0 rgba(255,255,255,0.20)";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    Get Directions
                    <span style={{ fontSize: "0.85rem" }}>→</span>
                  </a>
                </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ── SHARED SUB-COMPONENTS ─────────────────────────────────────────────────────

function InfoBlock({
  label, children, inView, delay,
}: {
  label: string; children: React.ReactNode; inView: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
      className="contact-info-block-box"
    >
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "1rem", fontWeight: 700,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "#D4AE6A", marginBottom: 10,
      }}>
        {label}
      </p>
      <div className="contact-section-divider" style={{ height: 1, background: "rgba(0,0,0,0.15)", marginBottom: 11 }} />
      {children}
    </motion.div>
  );
}

function InfoLine({ children, primary, href, large }: { children: React.ReactNode; primary?: boolean; href?: string; large?: boolean }) {
  const style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: large ? "clamp(2.2rem, 3.2vw, 3rem)" : "clamp(1.45rem, 2vw, 1.8rem)",
    fontWeight: large ? 500 : 400, lineHeight: 1.45,
    color: primary ? "#1A1A1A" : "rgba(0,0,0,0.70)",
    letterSpacing: "0.01em",
  };
  if (href) {
    return (
      <a href={href} className={large ? "contact-info-line-large" : "contact-info-line"} style={{ ...style, display: "block", textDecoration: "none", transition: "color 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C4A96A"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary ? "#1A1A1A" : "rgba(0,0,0,0.70)"; }}
      >
        {children}
      </a>
    );
  }
  return <p className={large ? "contact-info-line-large" : "contact-info-line"} style={style}>{children}</p>;
}
