"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/shearmadnesshoboken/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/ShearMadnessHobokenNJ/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/ShearMadnessNJ",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Google",
    href: "mailto:info@shearmadnesshoboken.com",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
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
}: {
  phone?:        string;
  email?:        string;
  addressLine1?: string;
  cityStateZip?: string;
  hoursTueThu?:  string;
  hoursFri?:     string;
  hoursSat?:     string;
  hoursSunMon?:  string;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

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
        {/* ── 3-COLUMN GRID ───────────────────────────────────────────────── */}
        <div id="footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr 1fr",
          gap: "clamp(32px, 5vw, 72px)",
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
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.45rem",
                fontWeight: 300,
                color: "#FAF6EF",
                letterSpacing: "0.02em",
              }}>
                Shear <em>Madness</em>
              </span>
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
                src="/hero-logo.png"
                alt="Shear Madness"
                style={{
                  width: "clamp(100px, 14vw, 160px)",
                  height: "auto",
                  opacity: 0.55,
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
          </motion.div>

          {/* ── RIGHT: NAV + SOCIAL ───────────────────────────────────────── */}
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
            }}>
              Navigation
            </p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
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
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map(s => (
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
        @media (max-width: 860px) {
          #footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          #footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .footer-hours-row { flex-wrap: wrap !important; gap: 2px !important; }
          .footer-hours-row span { white-space: normal !important; }
        }
      `}</style>
    </footer>
  );
}
