"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LUX:  [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const BIO_W = 310; // px — fixed width of the revealed bio panel

// ── BAMBOO LEAF DATA ──────────────────────────────────────────────────────────
const BAMBOO_LEAVES = [
  { id: 0, left:  6, size: 17, delay:   0, dur: 28, rot:  18, drift:  26, opacity: 0.72 },
  { id: 1, left: 22, size: 13, delay: -10, dur: 34, rot: -22, drift: -20, opacity: 0.62 },
  { id: 2, left: 48, size: 15, delay:  -6, dur: 30, rot:  30, drift:  32, opacity: 0.68 },
  { id: 3, left: 70, size: 12, delay: -19, dur: 36, rot: -14, drift: -28, opacity: 0.60 },
  { id: 4, left: 86, size: 16, delay:  -3, dur: 26, rot:  22, drift:  18, opacity: 0.65 },
  { id: 5, left: 38, size: 11, delay: -24, dur: 32, rot: -38, drift: -24, opacity: 0.58 },
  { id: 6, left: 58, size: 14, delay: -14, dur: 29, rot:  12, drift:  22, opacity: 0.63 },
];

const BAMBOO_CSS = `
  /* ── ARTIST PORTRAIT ──────────────────────────────────────────────────── */
  .artist-img-wrap {
    overflow: hidden;
    position: relative;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .artist-img-wrap img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
  .artist-img-wrap .portrait-main {
    filter: grayscale(100%);
    transition:
      filter   0.85s cubic-bezier(0.22, 1, 0.36, 1),
      opacity  0.85s cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* Unit-level hover triggers colour on the portrait */
  .artist-unit-hover:hover .portrait-main { filter: grayscale(0%); }

  /* Colour-reveal layer (Oscar) */
  .artist-img-wrap.has-hover:hover .portrait-main { opacity: 0; }
  .artist-img-wrap .portrait-hover {
    position: absolute; inset: 0; opacity: 0; transform: scale(1.04);
    transition:
      opacity   0.85s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .artist-img-wrap:hover .portrait-hover { opacity: 1; transform: scale(1.06); }

  /* ── BIO PANEL SCROLL (hidden scrollbar) ────────────────────────────── */
  .bio-scroll-inner {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .bio-scroll-inner::-webkit-scrollbar { display: none; }

  /* ── MOBILE BIO ROW — hidden on desktop ──────────────────────────────── */
  .mobile-bio-row { display: none; }
  .tap-hint       { display: none; }

  /* ── BAMBOO LEAF KEYFRAMES ────────────────────────────────────────────── */
  ${BAMBOO_LEAVES.map(({ id, rot, drift }) => `
  @keyframes bamboo-leaf-${id} {
    0%   { transform: translateY(-70px) translateX(0px) rotate(${rot}deg); opacity: 0; }
    10%  { opacity: 1; }
    85%  { opacity: 0.85; }
    100% { transform: translateY(3200px) translateX(${drift}px) rotate(${rot + 200}deg); opacity: 0; }
  }`).join("")}

  /* ── RESPONSIVE ───────────────────────────────────────────────────────── */

  /* Tablet / iPad (768–1180 px) — desktop-like hover layout, larger portraits */
  @media (min-width: 768px) and (max-width: 1180px) {
    .artists-row {
      gap: clamp(20px, 3.5vw, 48px) !important;
    }
    .artist-portrait-box {
      width: clamp(210px, 28vw, 290px) !important;
      height: clamp(420px, 44vw, 520px) !important;
      aspect-ratio: unset !important;
    }
    .bio-desktop-panel {
      height: clamp(420px, 44vw, 520px) !important;
    }
  }

  /* Mobile only: 2-column grid of compact tiles, tap-to-expand bio */
  @media (max-width: 767px) {
    .artists-row {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 14px !important;
      align-items: start !important;
    }
    .artist-unit-inner {
      flex-direction: column !important;
      width: 100% !important;
      max-width: 100% !important;
      transform: none !important;
    }
    .artist-portrait-box {
      width: 100% !important;
      height: 200px !important;
      aspect-ratio: unset !important;
      margin: 0 !important;
    }
    .bio-desktop-panel         { display: none !important; }
    .mobile-bio-row            { display: block !important; grid-column: 1 / -1; }
    .artist-overlay-subtitle   { display: none !important; }
    .artist-overlay-role       { display: none !important; }
    .artist-overlay-wrap       { padding: 18px 8px 10px !important; }
    .tap-hint                  { display: block !important; }
  }

  /* Background fix for tablets */
  @media (min-width: 641px) and (max-width: 1180px) {
    .artist-bg-fixed {
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center top !important;
    }
    #experience { height: auto !important; min-height: 100svh !important; }
  }
`;

// ── SHARED STYLE TOKENS ───────────────────────────────────────────────────────
const BIO_TEXT = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "clamp(0.76rem, 0.82vw, 0.86rem)",
  fontWeight: 400,
  lineHeight: 1.60,
  color: "#1a1208",
  letterSpacing: "0.01em",
} as const;

const BIO_CLOSING = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "clamp(0.84rem, 0.98vw, 1.0rem)",
  fontWeight: 600,
  fontStyle: "italic",
  color: "#3a2e1a",
  letterSpacing: "0.01em",
} as const;

const BIO_PANEL_INNER = {
  width: BIO_W,
  padding: "24px 22px 20px 20px",
  background: "rgba(252,248,236,0.90)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(198,167,107,0.28)",
  boxShadow: "0 18px 45px rgba(26,18,8,0.12), inset 0 0 0 1px rgba(255,255,255,0.24)",
} as const;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function ArtistSection({
  artistBg,
  oscarImage,
  georgeImage,
}: {
  artistBg?:    string;
  oscarImage?:  string;
  georgeImage?: string;
}) {
  const [hoveredArtist, setHoveredArtist] = useState<"oscar" | "george" | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [vw, setVw] = useState(0);

  useEffect(() => {
    // Only treat as touch on small screens (mobile); iPads use desktop hover layout
    const update = () => {
      setVw(window.innerWidth);
      setIsTouch(window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const ref    = useRef<HTMLElement>(null);
  const ref2   = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref,  { once: true, margin: "-60px" });
  const inView2 = useInView(ref2, { once: true, margin: "-60px" });

  const isMobile = vw > 0 && vw < 768;
  const isTablet = vw >= 768 && vw <= 1180;

  // Bio width mirrors portrait width formula at each breakpoint
  const bioWidth = vw >= 768 && vw <= 1180
    ? Math.min(260, Math.max(200, Math.round(vw * 0.24)))
    : Math.min(285, Math.max(240, Math.round(vw * 0.17)));

  const shadow = (active: boolean) =>
    active
      ? "0 32px 80px rgba(26,18,8,0.28), 0 8px 28px rgba(26,18,8,0.16)"
      : "0 24px 60px rgba(26,18,8,0.14), 0 4px 16px rgba(26,18,8,0.08)";

  return (
    <section
      ref={ref}
      id="experience"
      onClick={isTouch ? () => setHoveredArtist(null) : undefined}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: isMobile
          ? "clamp(64px, 9vh, 112px) clamp(24px, 7vw, 96px) clamp(36px, 5vh, 60px)"
          : isTablet
            ? "clamp(16px, 2.5vh, 28px) clamp(24px, 7vw, 96px) clamp(28px, 4vh, 48px)"
            : "clamp(32px, 4vh, 56px) clamp(24px, 7vw, 96px) clamp(28px, 4vh, 48px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: BAMBOO_CSS }} />

      {/* Background */}
      <div aria-hidden="true" className="artist-bg-fixed" style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url('${artistBg ?? "/artist-bg.jpg"}')`,
        backgroundAttachment: "scroll",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }} />

      {/* Bamboo leaves */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 3 }}>
        {BAMBOO_LEAVES.map(l => (
          <div
            key={l.id}
            style={{
              position: "absolute",
              left: `${l.left}%`,
              top: 0,
              animation: `bamboo-leaf-${l.id} ${l.dur}s ${l.delay}s linear infinite`,
              willChange: "transform, opacity",
            }}
          >
            <BambooLeafSVG size={l.size} opacity={l.opacity} />
          </div>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 4 }}>

        {/* ── SECTION HEADING ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ marginBottom: isMobile ? "clamp(32px, 5vh, 52px)" : "clamp(14px, 2vh, 24px)", textAlign: "center" }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: "#7A5C10", marginBottom: 3,
          }}>
            Meet the Artists
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            fontWeight: 600, lineHeight: 1.0,
            letterSpacing: "0.01em", color: "#556B2F", marginBottom: 2,
            display: "inline-block",
            background: "rgba(255,252,245,0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 6,
            padding: "2px 12px",
          }}>
            Our <em>Artists</em>
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>

        {/* ── CENTERED QUOTE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, ease: EASE, delay: 0.22 }}
          style={{ textAlign: "center", marginBottom: isMobile ? "clamp(28px, 4.5vh, 52px)" : "clamp(12px, 1.8vh, 20px)" }}
        >
          <blockquote style={{
            margin: "0 auto", maxWidth: 620,
            background: "rgba(255,252,245,0.45)",
            backdropFilter: "blur(4px)",
            borderRadius: 4,
            padding: "clamp(10px, 1.5vh, 16px) clamp(16px, 2vw, 28px)",
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.15rem, 1.8vw, 1.55rem)",
              fontWeight: 400, fontStyle: "italic",
              lineHeight: 1.65, color: "#1A1208",
            }}>
              &ldquo;Great style should feel effortless, personal, and quietly confident.&rdquo;
            </p>
          </blockquote>
        </motion.div>

        {/* ── ARTISTS ROW ────────────────────────────────────────────────────── */}
        <div
          className="artists-row"
          ref={ref2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "clamp(24px, 2.8vw, 40px)",
          }}
        >

          {/* ══ OSCAR ══ */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.14 }}
          >
            {/* Hover zone — nudges LEFT on own hover; collapses when George is hovered */}
            <motion.div
              className="artist-unit-inner artist-unit-hover"
              animate={{
                x:       isMobile ? 0 : hoveredArtist === "george" ? -40 : 0,
                scale:   isMobile ? 1 : hoveredArtist === "george" ? 0.82 : 1,
                opacity: isMobile ? 1 : hoveredArtist === "george" ? 0.38 : 1,
              }}
              transition={{ duration: 0.85, ease: LUX }}
              onMouseEnter={!isTouch ? () => setHoveredArtist("oscar") : undefined}
              onMouseLeave={!isTouch ? () => setHoveredArtist(null) : undefined}
              onClick={isTouch ? (e) => { e.stopPropagation(); setHoveredArtist(prev => prev === "oscar" ? null : "oscar"); } : undefined}
              style={{ display: "flex", flexDirection: "row", alignItems: "stretch", cursor: "pointer", touchAction: "manipulation" }}
            >
              {/* Portrait */}
              <motion.div
                className="artist-img-wrap artist-portrait-box"
                animate={{
                  scale:        isMobile ? 1 : hoveredArtist === "oscar" ? 1.02 : 1,
                  boxShadow:    shadow(!isMobile && hoveredArtist === "oscar"),
                  borderRadius: isMobile ? "14px" : hoveredArtist === "oscar" ? "14px 0 0 14px" : "14px",
                }}
                transition={{ duration: 0.75, ease: LUX }}
                style={{
                  width: "clamp(240px, 17vw, 285px)",
                  height: "clamp(460px, 40vw, 520px)",
                  border: "1px solid rgba(198,167,107,0.20)",
                  borderRadius: 14,
                }}
              >
                <Image
                  className="portrait-main"
                  src={oscarImage ?? "/oscar-about.png"}
                  alt="Oscar 'Victor' Landicho — Co-Founder & Master Stylist, Shear Madness Hoboken"
                  width={600} height={750}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
                {/* Name overlay */}
                <div className="artist-overlay-wrap" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(10,8,4,0.88) 0%, rgba(10,8,4,0.40) 55%, transparent 100%)",
                  padding: "clamp(28px, 5vh, 52px) clamp(10px, 1.5vw, 18px) clamp(14px, 2.5vh, 22px)",
                  textAlign: "center",
                }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.1rem, 1.6vw, 1.8rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "0.01em", color: "#E8D5A3", marginBottom: 4 }}>
                    Oscar <em>&ldquo;Victor&rdquo;</em> Landicho
                  </h3>
                  <p className="artist-overlay-role" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(198,167,107,0.80)" }}>
                    Master Stylist · Co-Founder · Manager
                  </p>
                  <span className="tap-hint" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginTop: 5 }}>
                    {hoveredArtist === "oscar" ? "tap to close ↑" : "tap for bio ↓"}
                  </span>
                </div>
              </motion.div>

              {/* Bio panel — slides out to the RIGHT on Oscar hover */}
              <motion.div
                className="bio-desktop-panel"
                style={{ overflow: "hidden", flexShrink: 0, height: "clamp(460px, 40vw, 520px)" }}
                animate={{
                  width:   hoveredArtist === "oscar" ? bioWidth : 0,
                  opacity: hoveredArtist === "oscar" ? 1        : 0,
                }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  style={{ width: bioWidth, height: "100%" }}
                  animate={{ x: hoveredArtist === "oscar" ? 0 : 18 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                >
                <div style={{ ...BIO_PANEL_INNER, width: "100%", borderRadius: "0 14px 14px 0", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 1, background: "linear-gradient(to right, rgba(198,167,107,0.55), transparent)", marginBottom: 16, flexShrink: 0 }} />
                  <div className="bio-scroll-inner" style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0, marginBottom: 16 }}>
                    <p style={BIO_TEXT}>
                      Co-founding Shear Madness in 2003, Oscar &ldquo;Victor&rdquo; Landicho has helped shape the salon into one of Hoboken&apos;s most trusted beauty destinations. As Manager, he continues to serve his longstanding clientele while also welcoming new guests through personal referrals and word of mouth.
                    </p>
                    <p style={BIO_TEXT}>
                      With nearly three decades of experience (since 1987) — including almost two decades in Hoboken — Oscar has become known for his precision, consistency, and intuitive understanding of personal style.
                    </p>
                  </div>
                  <p style={{ ...BIO_CLOSING, flexShrink: 0 }}>If the lights are on, Oscar &ldquo;Victor&rdquo; is in.</p>
                </div>
                </motion.div>
              </motion.div>
            </motion.div>

          </motion.div>

          {/* ══ GEORGE ══ */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.28 }}
          >
            {/* Hover zone — nudges RIGHT on own hover; collapses when Oscar is hovered */}
            <motion.div
              className="artist-unit-inner artist-unit-hover"
              animate={{
                x:       isMobile ? 0 : hoveredArtist === "george" ? 44 : hoveredArtist === "oscar" ? 40 : 0,
                scale:   isMobile ? 1 : hoveredArtist === "oscar" ? 0.82 : 1,
                opacity: isMobile ? 1 : hoveredArtist === "oscar" ? 0.38 : 1,
              }}
              transition={{ duration: 0.85, ease: LUX }}
              onMouseEnter={!isTouch ? () => setHoveredArtist("george") : undefined}
              onMouseLeave={!isTouch ? () => setHoveredArtist(null) : undefined}
              onClick={isTouch ? (e) => { e.stopPropagation(); setHoveredArtist(prev => prev === "george" ? null : "george"); } : undefined}
              style={{ display: "flex", flexDirection: "row", alignItems: "stretch", cursor: "pointer", touchAction: "manipulation" }}
            >
              {/* Bio panel — slides out to the LEFT on George hover (DOM-first = visually left) */}
              <motion.div
                className="bio-desktop-panel"
                style={{ overflow: "hidden", flexShrink: 0, height: "clamp(460px, 40vw, 520px)" }}
                animate={{
                  width:   hoveredArtist === "george" ? bioWidth : 0,
                  opacity: hoveredArtist === "george" ? 1        : 0,
                }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  style={{ width: bioWidth, height: "100%" }}
                  animate={{ x: hoveredArtist === "george" ? 0 : -18 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                >
                <div style={{ ...BIO_PANEL_INNER, width: "100%", borderRadius: "14px 0 0 14px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 1, background: "linear-gradient(to right, rgba(198,167,107,0.55), transparent)", marginBottom: 16, flexShrink: 0 }} />
                  <div className="bio-scroll-inner" style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0, marginBottom: 16 }}>
                    <p style={BIO_TEXT}>
                      George joined Shear Madness from the Spa at Port Liberté, bringing with him over 28 years of experience in the beauty industry. His expertise extends beyond the salon, having worked in the entertainment industry on Broadway and in film with renowned talents such as Melanie Griffith, Raul Julia, Melissa Manchester, and Rosie Perez.
                    </p>
                    <p style={BIO_TEXT}>
                      He also served as a National Educator for Glemby International, associated with prestigious retailers like Saks Fifth Avenue and Bergdorf Goodman. Specializing in cut, color, and styling, George also offers make-up and massage services.
                    </p>
                  </div>
                  <p style={{ ...BIO_CLOSING, flexShrink: 0 }}>Accepting appointments Tuesday – Saturday, 10:00 AM until closing.</p>
                </div>
                </motion.div>
              </motion.div>

              {/* Portrait */}
              <motion.div
                className="artist-img-wrap artist-portrait-box"
                animate={{
                  scale:        isMobile ? 1 : hoveredArtist === "george" ? 1.02 : 1,
                  boxShadow:    shadow(!isMobile && hoveredArtist === "george"),
                  borderRadius: isMobile ? "14px" : hoveredArtist === "george" ? "0 14px 14px 0" : "14px",
                }}
                transition={{ duration: 0.75, ease: LUX }}
                style={{
                  width: "clamp(240px, 17vw, 285px)",
                  height: "clamp(460px, 40vw, 520px)",
                  border: "1px solid rgba(198,167,107,0.20)",
                  borderRadius: 14,
                }}
              >
                <Image
                  className="portrait-main"
                  src={georgeImage ?? "/george-fraggos.jpg"}
                  alt="George Fraggos — Stylist, Shear Madness Hoboken"
                  width={600} height={750}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
                {/* Name overlay */}
                <div className="artist-overlay-wrap" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(10,8,4,0.88) 0%, rgba(10,8,4,0.40) 55%, transparent 100%)",
                  padding: "clamp(28px, 5vh, 52px) clamp(10px, 1.5vw, 18px) clamp(14px, 2.5vh, 22px)",
                  textAlign: "center",
                }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.1rem, 1.6vw, 1.8rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "0.01em", color: "#E8D5A3", marginBottom: 4 }}>
                    George <em>Fraggos</em>
                  </h3>
                  <p className="artist-overlay-role" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(198,167,107,0.80)" }}>
                    Stylist
                  </p>
                  <span className="tap-hint" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginTop: 5 }}>
                    {hoveredArtist === "george" ? "tap to close ↑" : "tap for bio ↓"}
                  </span>
                </div>
              </motion.div>
            </motion.div>

          </motion.div>

          {/* Mobile bio panel — spans both columns, rendered once, content swaps by state */}
          <div
            className="mobile-bio-row"
            onClick={(e) => e.stopPropagation()}
          >
            {hoveredArtist && (
              <div style={{
                background: "rgba(252,248,236,0.90)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(198,167,107,0.28)",
                borderRadius: 12,
                padding: "18px 20px",
                maxHeight: 260,
                overflowY: "auto",
                scrollbarWidth: "none",
              }}>
                <div style={{ height: 1, background: "linear-gradient(to right, rgba(198,167,107,0.55), transparent)", marginBottom: 14 }} />
                {hoveredArtist === "oscar" ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                      <p style={{ ...BIO_TEXT, fontSize: "0.85rem" }}>
                        Co-founding Shear Madness in 2003, Oscar &ldquo;Victor&rdquo; Landicho has helped shape the salon into one of Hoboken&apos;s most trusted beauty destinations. As Manager, he continues to serve his longstanding clientele while also welcoming new guests through personal referrals.
                      </p>
                      <p style={{ ...BIO_TEXT, fontSize: "0.85rem" }}>
                        With nearly three decades of experience (since 1987), Oscar has become known for his precision, consistency, and intuitive understanding of personal style.
                      </p>
                    </div>
                    <p style={{ ...BIO_CLOSING, fontSize: "0.92rem" }}>If the lights are on, Oscar &ldquo;Victor&rdquo; is in.</p>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                      <p style={{ ...BIO_TEXT, fontSize: "0.85rem" }}>
                        George joined Shear Madness from the Spa at Port Liberté, bringing over 28 years of experience — including Broadway and film work with Melanie Griffith, Raul Julia, and Rosie Perez.
                      </p>
                      <p style={{ ...BIO_TEXT, fontSize: "0.85rem" }}>
                        A former National Educator for Glemby International (Saks Fifth Avenue, Bergdorf Goodman), specializing in cut, color, styling, make-up, and massage.
                      </p>
                    </div>
                    <p style={{ ...BIO_CLOSING, fontSize: "0.92rem" }}>Accepting appointments Tuesday – Saturday, 10:00 AM until closing.</p>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

// ── BAMBOO LEAF SVG ───────────────────────────────────────────────────────────
function BambooLeafSVG({ size, opacity }: { size: number; opacity: number }) {
  const h     = Math.round(size * 3.6);
  const green = `rgba(78,108,52,${opacity})`;
  const vein  = `rgba(52,78,32,${opacity * 0.45})`;
  return (
    <svg width={size} height={h} viewBox="0 0 12 44" fill="none" style={{ display: "block" }}>
      <path d="M6,1 C8.8,2 11,8 11,16 C11,26 8.5,38 6,43 C3.5,38 1,26 1,16 C1,8 3.2,2 6,1 Z" fill={green} />
      <ellipse cx="7" cy="14" rx="2.2" ry="6" fill={`rgba(140,175,90,${opacity * 0.18})`} />
      <path d="M6,2 Q5.5,22 6,42" stroke={vein} strokeWidth="0.55" fill="none" />
      <path d="M6,10 Q9,12 10,18" stroke={vein} strokeWidth="0.30" fill="none" />
      <path d="M6,10 Q3,12 2,18"  stroke={vein} strokeWidth="0.30" fill="none" />
    </svg>
  );
}
