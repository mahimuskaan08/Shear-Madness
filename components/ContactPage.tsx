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
  "Just minutes from Hoboken PATH Station",
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
/* ── RESPONSIVE ─────────────────────────────────────────────────── */
@media (max-width: 860px) {
  #contact-grid { grid-template-columns: 1fr !important; }
  /* Remove negative pull-up so stacked columns don't overlap */
  #contact-grid > *:last-child { margin-top: 0 !important; }
  /* Prevent hours row from overflowing on narrow screens */
  .contact-hours-row { flex-wrap: wrap !important; gap: 4px !important; }
  .contact-hours-time { font-size: 1rem !important; }
  .contact-hours-day  { font-size: 1rem !important; }
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

      {/* ── WATER BACKGROUND ────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <img
          src={bgImage ?? "/contact-water.jpg"}
          alt=""
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            filter: "grayscale(60%) brightness(1.05) saturate(0.5)",
            opacity: 0.50,
            mixBlendMode: "multiply",
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
            color: "#7A5C10", marginBottom: 8,
          }}>
            Find Us
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 6vw, 5.4rem)",
            fontWeight: 600, lineHeight: 1.0,
            letterSpacing: "0.01em", color: "#556B2F", marginBottom: 18,
          }}>
            Location
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>

        {/* ── 2-COLUMN LAYOUT ──────────────────────────────────────────────────── */}
        <div id="contact-grid" style={{
          display: "grid",
          gridTemplateColumns: "8fr 420px",
          gap: "clamp(72px, 9vw, 120px)",
          alignItems: "start",
        }}>

          {/* ── LEFT: MAP + BULLETS (no koi here) ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          >
            <div style={{
              borderRadius: 20, overflow: "hidden",
              aspectRatio: "4/1.98", position: "relative",
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, ease: EASE, delay: 0.5 }}
              style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 9 }}
            >
              {MAP_BULLETS.map((bullet, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C6A76B", flexShrink: 0, opacity: 0.90 }} />
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(1.15rem, 1.7vw, 1.4rem)",
                    fontWeight: 700, color: "#111111", letterSpacing: "0.01em",
                  }}>
                    {bullet}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: KOI PANEL ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.28 }}
            style={{
              marginTop: "-96px",
              position: "relative",
            }}
          >

            {/* Koi image — centered, fades at all edges, doesn't fill full section */}
            <img
              src="/contact-koi.png"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "106%",
                height: "auto",
                opacity: 0.50,
                filter: "grayscale(50%) brightness(1.06) contrast(0.88) saturate(0.75)",
                mixBlendMode: "multiply",
                WebkitMaskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, black 25%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, black 25%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <div style={{
              display: "flex", flexDirection: "column",
              gap: "clamp(26px, 3.2vh, 36px)",
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
                        fontSize: "clamp(1.2rem, 1.6vw, 1.45rem)",
                        fontWeight: 800, color: "#000000",
                        letterSpacing: "0.01em", whiteSpace: "nowrap",
                      }}>
                        {days}
                      </span>
                      <span className="contact-hours-time" style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)",
                        fontWeight: 800,
                        color: time === "Closed" ? "rgba(0,0,0,0.45)" : "#000000",
                        letterSpacing: "0.01em", textAlign: "right", whiteSpace: "nowrap",
                      }}>
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </InfoBlock>

              <InfoBlock label="Contact" inView={inView} delay={0.62}>
                <InfoLine primary>{displayEmail}</InfoLine>
                <InfoLine>{displayPhone}</InfoLine>
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
    >
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.65rem", fontWeight: 700,
        letterSpacing: "0.32em", textTransform: "uppercase",
        color: "#7A5C10", marginBottom: 10,
      }}>
        {label}
      </p>
      <div style={{ height: 1, background: "rgba(26,18,8,0.12)", marginBottom: 11 }} />
      {children}
    </motion.div>
  );
}

function InfoLine({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <p style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: "clamp(1.45rem, 2vw, 1.8rem)",
      fontWeight: 400, lineHeight: 1.55,
      color: primary ? "#0A0A0A" : "rgba(10,10,10,0.78)",
      letterSpacing: "0.01em",
    }}>
      {children}
    </p>
  );
}
