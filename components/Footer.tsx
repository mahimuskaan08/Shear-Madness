"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { SiteSocial } from "@/lib/site-data";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV_LINKS = [
  { label: "Home",       href: "/"          },
  { label: "About Us",   href: "/#our-story" },
  { label: "Services",   href: "/#services"  },
  { label: "Our Artists",href: "/#experience"},
  { label: "Gallery",    href: "/#gallery"   },
  { label: "Contact Us", href: "/contact"    },
];

const DEFAULT_HOURS = [
  { days: "Tue – Thu", time: "10:00 am – 9:00 pm" },
  { days: "Fri",       time: "10:00 am – 8:00 pm" },
  { days: "Sat",       time: "10:00 am – 6:00 pm" },
  { days: "Sun – Mon", time: "Closed"              },
];

// SVG icons keyed by lowercase platform name
const ICON_MAP: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  x: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tiktok: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.81a8.18 8.18 0 0 0 4.78 1.52V6.9a4.85 4.85 0 0 1-1.01-.21z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="currentColor" stroke="none" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  ),
};

const GENERIC_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// Hardcoded fallback used when no social prop is passed
const FALLBACK_SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/shearmadnesshoboken/",  icon: ICON_MAP.instagram },
  { label: "Facebook",  href: "https://www.facebook.com/ShearMadnessHobokenNJ/", icon: ICON_MAP.facebook  },
  { label: "X",         href: "https://x.com/ShearMadnessNJ",                    icon: ICON_MAP.x         },
];

const MAP_BULLETS = [
  "5 min walk from Hoboken Path",
  "Street parking nearby",
];

export default function Footer({
  phone,
  email,
  addressLine1,
  cityStateZip,
  hoursTueThu,
  hoursFri,
  hoursSat,
  hoursSunMon,
  social,
  mapsUrl,
}: {
  phone?:        string;
  email?:        string;
  addressLine1?: string;
  cityStateZip?: string;
  hoursTueThu?:  string;
  hoursFri?:     string;
  hoursSat?:     string;
  hoursSunMon?:  string;
  social?:       SiteSocial[];
  mapsUrl?:      string;
} = {}) {
  const socialsToShow = social?.filter(s => s.is_enabled && s.url).map(s => ({
    label: s.platform,
    href:  s.url,
    icon:  ICON_MAP[s.platform.toLowerCase()] ?? GENERIC_ICON,
  })) ?? FALLBACK_SOCIALS;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const displayMapsUrl     = mapsUrl      || "https://www.google.com/maps/dir/?api=1&destination=80+Park+Ave,+Hoboken,+NJ+07030";
  const displayPhone       = phone        || "(201) 222-2102";
  const displayEmail       = email        || "info@shearmadnesshoboken.com";
  const displayAddr1       = addressLine1 || "80 Park Ave";
  const displayCityStateZip = cityStateZip || "Hoboken, NJ 07030";
  const telHref            = `tel:+1${displayPhone.replace(/\D/g, "")}`;
  const HOURS = [
    { days: "Tue – Thu", time: hoursTueThu ?? DEFAULT_HOURS[0].time },
    { days: "Fri",       time: hoursFri    ?? DEFAULT_HOURS[1].time },
    { days: "Sat",       time: hoursSat    ?? DEFAULT_HOURS[2].time },
    { days: "Sun – Mon", time: hoursSunMon ?? DEFAULT_HOURS[3].time },
  ];

  return (
    <footer
      style={{
        background: "#1E1C18",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* Faint lotus ornament */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, right: 0,
        width: 320, height: 320, opacity: 0.03, pointerEvents: "none",
      }}>
        <svg viewBox="0 0 300 300" fill="none">
          {[0,36,72,108,144,180,216,252,288,324].map((angle, i) => (
            <ellipse key={i} cx="150" cy="55" rx="18" ry="50" fill="#C4A96A"
              transform={`rotate(${angle} 150 150)`} />
          ))}
          <circle cx="150" cy="150" r="22" fill="#C4A96A" opacity="0.5" />
        </svg>
      </div>

      <div
        ref={ref}
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(48px, 7vh, 80px) clamp(24px, 6vw, 80px) 0",
        }}
      >
        {/* ── 4-COLUMN GRID ───────────────────────────────────────────────── */}
        <div id="footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1fr 1fr",
          gap: "clamp(24px, 4vw, 56px)",
          marginBottom: "clamp(40px, 6vh, 64px)",
        }}>

          {/* ── LEFT: BRAND + CONTACT ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {/* Logo */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.45rem",
                  fontWeight: 300,
                  color: "#FAF6EF",
                  letterSpacing: "0.02em",
                }}>
                  Shear <em>Madness</em>
                </span>
                <span style={{
                  borderLeft: "1px solid rgba(196,169,106,0.45)",
                  paddingLeft: 10,
                  marginLeft: 10,
                }}>
                  <span style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "10px",
                    letterSpacing: "0.04em",
                    color: "rgba(250,246,239,0.55)",
                    fontStyle: "italic",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    display: "block",
                  }}>
                    A Salon for Men &amp; Women
                  </span>
                </span>
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.5rem",
                fontWeight: 500,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "rgba(250,246,239,0.35)",
                marginTop: 3,
              }}>
                Hoboken · NJ
              </p>
            </div>

            {/* Divider */}
            <div style={{
              height: 1, width: 36, marginBottom: 20,
              background: "linear-gradient(to right, #C6A76B, transparent)",
            }} />

            {/* Address + Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                fontWeight: 400,
                color: "rgba(250,246,239,0.62)",
                lineHeight: 1.7,
              }}>
                {displayAddr1}<br />{displayCityStateZip}
              </p>
              <a href={`mailto:${displayEmail}`} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(250,246,239,0.52)",
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "color 0.3s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C6A76B")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,246,239,0.52)")}
              >
                {displayEmail}
              </a>
              <a href={telHref} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(250,246,239,0.52)",
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "color 0.3s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C6A76B")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,246,239,0.52)")}
              >
                {displayPhone}
              </a>
            </div>
          </motion.div>

          {/* ── CENTER: SALON HOURS ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color: "#7A5C10",
              marginBottom: 16,
            }}>
              Salon Hours
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HOURS.map(({ days, time }) => (
                <div key={days} className="footer-hours-row" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)",
                    fontWeight: 500,
                    color: "#FAF6EF",
                    whiteSpace: "nowrap",
                  }}>
                    {days}
                  </span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)",
                    fontWeight: 400,
                    color: time === "Closed" ? "rgba(250,246,239,0.28)" : "rgba(250,246,239,0.58)",
                    whiteSpace: "nowrap",
                    fontStyle: time === "Closed" ? "italic" : "normal",
                  }}>
                    {time}
                  </span>
                </div>
              ))}
            </div>

            {/* Logo below hours */}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <img
                src="/logo-web.png"
                alt="Shear Madness — A Salon For Men & Women"
                style={{
                  width: "clamp(140px, 18vw, 220px)",
                  height: "auto",
                  opacity: 0.55,
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </motion.div>

          {/* ── COL 3: NAV + SOCIAL ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.24 }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color: "#7A5C10",
              marginBottom: 16,
              textAlign: "center",
            }}>
              Navigation
            </p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px 20px", marginBottom: 28, justifyContent: "center" }}>
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 400,
                      color: "rgba(250,246,239,0.52)",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      transition: "color 0.28s",
                      display: "inline-block",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#C6A76B")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,246,239,0.52)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {socialsToShow.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(250,246,239,0.40)",
                    border: "1px solid rgba(250,246,239,0.10)",
                    borderRadius: 6,
                    transition: "all 0.28s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#C6A76B";
                    el.style.borderColor = "rgba(198,167,107,0.45)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "rgba(250,246,239,0.40)";
                    el.style.borderColor = "rgba(250,246,239,0.10)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── COL 4: MAP ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.36 }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.30em",
              textTransform: "uppercase",
              color: "#7A5C10",
              marginBottom: 16,
            }}>
              Find Us
            </p>

            <div id="footer-map-box" style={{
              borderRadius: 12, overflow: "hidden",
              aspectRatio: "1/1", position: "relative",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              border: "1px solid rgba(198,167,107,0.18)",
              marginBottom: 12,
            }}>
              <iframe
                src="https://www.google.com/maps?q=80+Park+Ave,+Hoboken,+NJ+07030&output=embed"
                width="100%" height="100%"
                style={{
                  border: 0, display: "block",
                  width: "100%", height: "100%",
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  filter: "grayscale(30%) contrast(1.02) brightness(0.88)",
                }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shear Madness location map"
              />
            </div>

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {MAP_BULLETS.map(bullet => (
                <li key={bullet} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 400,
                  color: "rgba(250,246,239,0.45)",
                  letterSpacing: "0.01em",
                  lineHeight: 1.4,
                }}>
                  <span style={{ color: "#C6A76B", fontSize: "0.55rem", flexShrink: 0 }}>◆</span>
                  {bullet}
                </li>
              ))}
            </ul>

            <a
              href={displayMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 12,
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C6A76B",
                textDecoration: "none",
                transition: "opacity 0.25s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Get Directions →
            </a>
          </motion.div>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          style={{
            borderTop: "1px solid rgba(250,246,239,0.07)",
            padding: "18px 0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.68rem",
            color: "rgba(250,246,239,0.22)",
            letterSpacing: "0.06em",
          }}>
            © {new Date().getFullYear()} Shear Madness Hoboken. All rights reserved.
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1100px) and (min-width: 901px) {
          #footer-grid { gap: 20px !important; }
        }
        @media (max-width: 900px) {
          #footer-grid { grid-template-columns: 1fr 1fr !important; }
          #footer-map-box { aspect-ratio: 16/7 !important; }
        }
        @media (max-width: 640px) {
          #footer-grid { grid-template-columns: 1fr !important; }
          #footer-map-box { aspect-ratio: 16/6 !important; }
        }
        @media (max-width: 380px) {
          .footer-hours-row { flex-wrap: wrap !important; gap: 2px !important; }
          .footer-hours-row span { white-space: normal !important; }
        }
      `}</style>
    </footer>
  );
}
