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

const MAP_BULLETS = [
  "5 Mins walk from Hoboken Path Station",
  "Street parking available nearby",
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
/* ── Per-block transparent pill ─────────────────────────────────── */
.contact-info-block-box {
  background: rgba(0,0,0,0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 14px;
  padding: clamp(14px, 2.2vw, 20px) clamp(16px, 2.5vw, 24px);
  border: 1px solid rgba(255,255,255,0.13);
}
/* ── RESPONSIVE ─────────────────────────────────────────────────── */
@media (min-width: 601px) and (max-width: 1100px) {
  /* iPad: shrink info panel, grow map */
  #contact-info-panel { max-width: 300px !important; }
  #contact-info-panel .contact-hours-day  { font-size: 0.95rem !important; }
  #contact-info-panel .contact-hours-time { font-size: 0.88rem !important; }
  #contact-map { width: clamp(180px, 26vw, 300px) !important; }
  /* iPad: keep full bg coverage, no cropping */
  #contact-bg-img { object-position: center center !important; object-fit: cover !important; }
}
@media (max-width: 600px) {
  #contact-grid { flex-direction: column !important; }
  /* Prevent hours row from overflowing on narrow screens */
  .contact-hours-row { flex-wrap: wrap !important; gap: 4px !important; }
  .contact-hours-time { font-size: 1.35rem !important; }
  .contact-hours-day  { font-size: 1.35rem !important; }
}
/* ── Mobile background image swap ── */
.contact-bg-mobile { display: none; }
@media (max-width: 767px) {
  #contact-bg-img     { display: none !important; }
  .contact-bg-mobile  { display: block !important; }
  .contact-info-block-box {
    background: rgba(0,0,0,0.30) !important;
    border-color: rgba(255,255,255,0.16) !important;
  }
  /* Larger text on mobile */
  .contact-info-line { font-size: 1.7rem !important; }
  .contact-section-divider {
    background: rgba(255,255,255,0.25) !important;
  }
}
`;

export default function ContactPage({
  bgImage,
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
  bgImage?:      string;
  phone?:        string;
  email?:        string;
  addressLine1?: string;
  cityStateZip?: string;
  hoursTueThu?:  string;
  hoursFri?:     string;
  hoursSat?:     string;
  hoursSunMon?:  string;
  mapsUrl?:      string;
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
            objectFit: "cover", objectPosition: "15% center",
            opacity: 0.90,
          }}
        />
        {/* Mobile-only background */}
        <img
          className="contact-bg-mobile"
          src="/contact-koi-bg-mobile.png"
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center center",
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
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: "#FFFFFF", marginBottom: 8,
          }}>
            Find Us
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 6vw, 5.4rem)",
            fontWeight: 600, lineHeight: 1.0,
            letterSpacing: "0.01em", color: "#FFFFFF", marginBottom: 18,
          }}>
            Hours and Location
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>

        {/* ── 2-COLUMN LAYOUT ──────────────────────────────────────────────────── */}
        <div id="contact-grid" style={{
          display: "flex",
          gap: "clamp(40px, 4vw, 64px)",
          alignItems: "start",
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
              gap: "clamp(14px, 2vh, 20px)",
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
                          color: "#FFFFFF",
                          letterSpacing: time === "Closed" ? "0.08em" : "0.01em",
                          textTransform: time === "Closed" ? "uppercase" : undefined,
                          whiteSpace: "nowrap",
                        }}>
                          {days}
                        </span>
                        <span className="contact-hours-time" style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: time === "Closed" ? "clamp(1.35rem, 1.8vw, 1.6rem)" : "clamp(1.1rem, 1.5vw, 1.3rem)",
                          fontWeight: time === "Closed" ? 900 : 800,
                          color: time === "Closed" ? "rgba(255,255,255,0.55)" : "#FFFFFF",
                          letterSpacing: time === "Closed" ? "0.12em" : "0.01em",
                          textTransform: time === "Closed" ? "uppercase" : undefined,
                          textAlign: "right", whiteSpace: "nowrap",
                          background: "rgba(255,255,255,0.14)",
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          borderRadius: 6,
                          padding: "2px 10px",
                        }}>
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </InfoBlock>

                <InfoBlock label="Contact" inView={inView} delay={0.62}>
                  <InfoLine primary href={`mailto:${displayEmail}`}>{displayEmail}</InfoLine>
                  <InfoLine href={telHref}>{displayPhone}</InfoLine>
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

          {/* ── RIGHT: SMALL MAP ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
            id="contact-map"
            style={{ width: "clamp(130px, 16vw, 220px)", flexShrink: 0 }}
          >
            <div style={{
              borderRadius: 20, overflow: "hidden",
              aspectRatio: "1/1", position: "relative",
              boxShadow: "0 12px 48px rgba(26,18,8,0.14), 0 2px 8px rgba(26,18,8,0.08)",
              border: "1px solid rgba(198,167,107,0.18)",
            }}>
              <iframe
                src="https://www.google.com/maps?q=80+Park+Ave,+Hoboken,+NJ+07030&output=embed"
                width="100%" height="100%"
                style={{
                  border: 0, display: "block",
                  width: "100%", height: "100%",
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  filter: "grayscale(20%) contrast(1.02)",
                }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shear Madness location map"
              />
            </div>

            {/* ── MAP BULLETS ─────────────────────────────────────── */}
            <ul style={{
              listStyle: "none", margin: "14px 0 0", padding: 0,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {MAP_BULLETS.map((bullet) => (
                <li key={bullet} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(0.68rem, 0.9vw, 0.78rem)",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.90)",
                  letterSpacing: "0.02em",
                  lineHeight: 1.45,
                  textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ color: "#C6A76B", fontSize: "0.65rem", marginTop: "0.18em", flexShrink: 0 }}>◆</span>
                  {bullet}
                </li>
              ))}
            </ul>
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
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.65rem", fontWeight: 700,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: "#D4AE6A", marginBottom: 10,
      }}>
        {label}
      </p>
      <div className="contact-section-divider" style={{ height: 1, background: "rgba(255,255,255,0.22)", marginBottom: 11 }} />
      {children}
    </motion.div>
  );
}

function InfoLine({ children, primary, href }: { children: React.ReactNode; primary?: boolean; href?: string }) {
  const style: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "clamp(1.45rem, 2vw, 1.8rem)",
    fontWeight: 400, lineHeight: 1.55,
    color: primary ? "#FFFFFF" : "rgba(255,255,255,0.82)",
    letterSpacing: "0.01em",
  };
  if (href) {
    return (
      <a href={href} className="contact-info-line" style={{ ...style, display: "block", textDecoration: "none", transition: "color 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C4A96A"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = primary ? "#FFFFFF" : "rgba(255,255,255,0.82)"; }}
      >
        {children}
      </a>
    );
  }
  return <p className="contact-info-line" style={style}>{children}</p>;
}
