"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";


const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── BAMBOO LEAF DATA ──────────────────────────────────────────────────────────
// Fewer leaves, slow and deliberate — bamboo falls calmly, not like petals.
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
  }
  /* shared base for all portrait images */
  .artist-img-wrap img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  /* primary (greyscale) image */
  .artist-img-wrap .portrait-main {
    filter: grayscale(100%);
    transform: scale(1.0);
    transition:
      filter   0.95s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.95s cubic-bezier(0.22, 1, 0.36, 1),
      opacity   0.95s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .artist-img-wrap:hover .portrait-main {
    filter: grayscale(0%);
    transform: scale(1.06);
  }
  /* Oscar only — fade out main to reveal colour hover image beneath */
  .artist-img-wrap.has-hover .portrait-main {
    transition:
      filter   0.95s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.95s cubic-bezier(0.22, 1, 0.36, 1),
      opacity   0.95s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .artist-img-wrap.has-hover:hover .portrait-main {
    opacity: 0;
  }
  /* hover / colour image — sits absolutely on top */
  .artist-img-wrap .portrait-hover {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(1.04);
    transition:
      opacity   0.95s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .artist-img-wrap:hover .portrait-hover {
    opacity: 1;
    transform: scale(1.06);
  }

  /* ── BAMBOO LEAF KEYFRAMES ────────────────────────────────────────────── */
  ${BAMBOO_LEAVES.map(({ id, rot, drift }) => `
  @keyframes bamboo-leaf-${id} {
    0%   { transform: translateY(-70px) translateX(0px) rotate(${rot}deg); opacity: 0; }
    10%  { opacity: 1; }
    85%  { opacity: 0.85; }
    100% { transform: translateY(3200px) translateX(${drift}px) rotate(${rot + 200}deg); opacity: 0; }
  }`).join("")}

  /* ── RESPONSIVE ───────────────────────────────────────────────────────── */
  @media (max-width: 860px) {
    #artist-grid  { grid-template-columns: 1fr !important; }
    #artist-grid  > *:first-child { max-width: 420px; margin: 0 auto; width: 100%; }
    #artist-grid2 { grid-template-columns: 1fr !important; }
    #artist-grid2 > *:last-child  { max-width: 420px; margin: 0 auto; width: 100%; order: -1; }
  }
  @media (max-width: 640px) {
    .artist-bg-fixed {
      background-attachment: scroll !important;
    }
  }
`;

export default function ArtistSection({
  artistBg,
  oscarImage,
  georgeImage,
}: {
  artistBg?:   string;
  oscarImage?: string;
  georgeImage?: string;
}) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const ref2    = useRef<HTMLDivElement>(null);
  const inView2 = useInView(ref2, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      id="experience"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(64px, 9vh, 112px) clamp(24px, 7vw, 96px) clamp(36px, 5vh, 60px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: BAMBOO_CSS }} />

      {/* ── FIXED BACKGROUND LAYERS — viewport-pinned, clipped by section overflow:hidden ── */}

      {/* Layer 1: greyscale image — fixed to viewport */}
      <div aria-hidden="true" className="artist-bg-fixed" style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url('${artistBg ?? "/artist-bg.jpg"}')`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "grayscale(100%) brightness(1.04) contrast(0.92)",
        opacity: 0.55,
      }} />

      {/* Layer 2: colour restoration — fixed to viewport */}
      <div aria-hidden="true" className="artist-bg-fixed" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `url('${artistBg ?? "/artist-bg.jpg"}')`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.28,
        mixBlendMode: "color",
      }} />

      {/* Layer 3: blend wash */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(236,234,231,0.60) 0%, rgba(236,234,231,0.28) 30%, rgba(236,234,231,0.22) 70%, rgba(236,234,231,0.60) 100%)",
      }} />

      {/* Layer 4: gold accent */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 60% at 80% 55%, rgba(198,167,107,0.06) 0%, transparent 70%)",
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

      {/* ── CONTENT ──────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 4 }}>

        {/* ── SECTION HEADING ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ marginBottom: "clamp(40px, 6vh, 64px)" }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: "#7A5C10", marginBottom: 8,
          }}>
            Meet the Artist
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            fontWeight: 600, lineHeight: 1.0,
            letterSpacing: "0.01em", color: "#556B2F", marginBottom: 14,
          }}>
            Our <em>Artist</em>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
          </div>
        </motion.div>

        {/* ── TWO-COLUMN GRID ─────────────────────────────────────────────────── */}
        <div
          id="artist-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.25fr",
            gap: "clamp(40px, 7vw, 96px)",
            alignItems: "stretch",
          }}
        >
          {/* ── LEFT: PORTRAIT ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.14 }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div
              className="artist-img-wrap"
              style={{
                flex: 1,
                minHeight: "clamp(320px, 50vh, 560px)",
                boxShadow: "0 28px 72px rgba(26,18,8,0.16), 0 4px 18px rgba(26,18,8,0.08)",
                border: "1px solid rgba(198,167,107,0.22)",
              }}
            >
              <Image
                className="portrait-main"
                src={oscarImage ?? "/oscar-about.png"}
                alt="Oscar 'Victor' Landicho — Co-Founder & Master Stylist, Shear Madness Hoboken"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>

            <div style={{ marginTop: 14, paddingLeft: 2 }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.60rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(26,18,8,0.36)",
              }}>
                Co-Founder &amp; Manager · Shear Madness Hoboken
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: TEXT ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.26 }}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 28px)" }}
          >
            <div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.0rem, 3.2vw, 3.0rem)",
                fontWeight: 600, lineHeight: 1.1,
                letterSpacing: "0.01em", color: "#556B2F", marginBottom: 8,
              }}>
                Oscar <em>"Victor"</em> Landicho
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.62rem", fontWeight: 700,
                letterSpacing: "0.26em", textTransform: "uppercase",
                color: "#7A5C10",
              }}>
                Master Stylist · Co-Founder · Manager
              </p>
            </div>

            <div style={{ height: 1, background: "linear-gradient(to right, rgba(198,167,107,0.45), transparent)" }} />

            <blockquote style={{
              margin: 0,
              padding: "0 0 0 clamp(16px, 2vw, 22px)",
              borderLeft: "2px solid rgba(198,167,107,0.55)",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.2rem, 1.9vw, 1.55rem)",
                fontWeight: 400, fontStyle: "italic",
                lineHeight: 1.6, color: "#1A1208",
                letterSpacing: "0.01em",
              }}>
                &ldquo;Great style should feel effortless, personal, and quietly confident.&rdquo;
              </p>
            </blockquote>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(1.0rem, 1.05vw, 1.06rem)",
                fontWeight: 400, lineHeight: 1.78,
                color: "#111111", letterSpacing: "0.012em",
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                textAlign: "justify",
              }}>
                Co-founding Shear Madness in 2003, Oscar &ldquo;Victor&rdquo; Landicho has helped shape the salon into
                one of Hoboken&apos;s most trusted beauty destinations. As Manager, he continues to
                serve his longstanding clientele while also welcoming new guests through personal referrals
                and word of mouth.
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(1.0rem, 1.05vw, 1.06rem)",
                fontWeight: 400, lineHeight: 1.78,
                color: "#111111", letterSpacing: "0.012em",
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                textAlign: "justify",
              }}>
                With nearly three decades of experience (since 1987) — including almost two decades in
                Hoboken — Oscar has become known for his precision, consistency, and intuitive understanding
                of personal style. His expertise in cut and color has made him especially sought after,
                earning the trust of both longtime clients and first-time visitors alike.
              </p>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.05rem, 1.55vw, 1.3rem)",
              fontWeight: 600, fontStyle: "italic",
              color: "#111111", letterSpacing: "0.01em",
              marginTop: 4,
            }}>
              If the lights are on, Oscar &ldquo;Victor&rdquo; is in.
            </p>
          </motion.div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
        <div style={{
          margin: "clamp(56px, 8vh, 96px) 0",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.45))" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C6A76B", opacity: 0.70 }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.45))" }} />
        </div>

        {/* ── GEORGE FRAGGOS ──────────────────────────────────────────────────── */}
        <div
          id="artist-grid2"
          ref={ref2}
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 1fr",
            gap: "clamp(40px, 7vw, 96px)",
            alignItems: "stretch",
          }}
        >
          {/* ── LEFT: TEXT ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.14 }}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3vh, 28px)" }}
          >
            <div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.0rem, 3.2vw, 3.0rem)",
                fontWeight: 600, lineHeight: 1.1,
                letterSpacing: "0.01em", color: "#556B2F", marginBottom: 8,
              }}>
                George <em>Fraggos</em>
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.62rem", fontWeight: 700,
                letterSpacing: "0.26em", textTransform: "uppercase",
                color: "#7A5C10",
              }}>
                Stylist
              </p>
            </div>

            <div style={{ height: 1, background: "linear-gradient(to right, rgba(198,167,107,0.45), transparent)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(1.0rem, 1.05vw, 1.06rem)",
                fontWeight: 400, lineHeight: 1.78,
                color: "#111111", letterSpacing: "0.012em",
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                textAlign: "justify",
              }}>
                George joined Shear Madness from the Spa at Port Liberté, bringing with him over 28 years
                of experience in the beauty industry. His expertise extends beyond the salon, having worked
                in the entertainment industry on Broadway and in film with renowned talents such as Melanie
                Griffith, Raul Julia, Melissa Manchester, and Rosie Perez. He also served as a National
                Educator for Glemby International, a major force in the salon industry associated with
                prestigious retailers like Saks Fifth Avenue and Bergdorf Goodman.
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(1.0rem, 1.05vw, 1.06rem)",
                fontWeight: 400, lineHeight: 1.78,
                color: "#111111", letterSpacing: "0.012em",
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                textAlign: "justify",
              }}>
                Specializing in cut, color, and styling, George also offers make-up and massage services,
                making him an exceptional choice for discerning clients seeking a comprehensive and
                personalized experience.
              </p>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.05rem, 1.55vw, 1.3rem)",
              fontWeight: 600, fontStyle: "italic",
              color: "#111111", letterSpacing: "0.01em",
              marginTop: 4,
            }}>
              Accepting appointments Tuesday – Saturday, 10:00 AM until closing.
            </p>
          </motion.div>

          {/* ── RIGHT: PORTRAIT ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.26 }}
            style={{ display: "flex", flexDirection: "column", height: "100%", padding: "10%" }}
          >
            <div
              className="artist-img-wrap"
              style={{
                flex: 1,
                minHeight: "clamp(320px, 50vh, 560px)",
                boxShadow: "0 28px 72px rgba(26,18,8,0.16), 0 4px 18px rgba(26,18,8,0.08)",
                border: "1px solid rgba(198,167,107,0.22)",
              }}
            >
              <Image
                className="portrait-main"
                src={georgeImage ?? "/george-fraggos.jpg"}
                alt="George Fraggos - Stylist"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>

            <div style={{ marginTop: 14, paddingLeft: 2 }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.60rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(26,18,8,0.36)",
              }}>
                Stylist · Shear Madness Hoboken
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ── BAMBOO LEAF SVG ───────────────────────────────────────────────────────────
// Elongated, slightly asymmetric leaf — natural bamboo shape with center vein.
// Color matches the bamboo in the background image: deep forest green.
function BambooLeafSVG({ size, opacity }: { size: number; opacity: number }) {
  const h = Math.round(size * 3.6);
  const green = `rgba(78,108,52,${opacity})`;
  const vein  = `rgba(52,78,32,${opacity * 0.45})`;
  return (
    <svg width={size} height={h} viewBox="0 0 12 44" fill="none" style={{ display: "block" }}>
      {/* Main leaf body — tapered at both ends, wider in upper third */}
      <path
        d="M6,1 C8.8,2 11,8 11,16 C11,26 8.5,38 6,43 C3.5,38 1,26 1,16 C1,8 3.2,2 6,1 Z"
        fill={green}
      />
      {/* Slight highlight on upper surface */}
      <ellipse cx="7" cy="14" rx="2.2" ry="6" fill={`rgba(140,175,90,${opacity * 0.18})`} />
      {/* Center vein */}
      <path d="M6,2 Q5.5,22 6,42" stroke={vein} strokeWidth="0.55" fill="none" />
      {/* Two subtle side veins */}
      <path d="M6,10 Q9,12 10,18" stroke={vein} strokeWidth="0.30" fill="none" />
      <path d="M6,10 Q3,12 2,18"  stroke={vein} strokeWidth="0.30" fill="none" />
    </svg>
  );
}
