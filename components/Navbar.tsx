"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SERVICE_ITEMS = [
  { label: "Women's Services", href: "/services#womens" },
  { label: "Men's Services",   href: "/services#mens" },
  { label: "Hair Treatments",  href: "/services#treatments" },
];

const GALLERY_ITEMS = [
  { label: "Portfolio", href: "/gallery#portfolio" },
  { label: "Reviews",   href: "/gallery#reviews"   },
  { label: "Credits",   href: "/credits"            },
];

const navLinks = [
  { label: "Home",     href: "/",            dropdown: false, items: [] },
  { label: "About",    href: "/#our-story",  dropdown: false, items: [] },
  { label: "Services", href: "/services",    dropdown: true,  items: SERVICE_ITEMS },
  { label: "Artist",   href: "/#experience", dropdown: false, items: [] },
  { label: "Gallery",  href: "/gallery",     dropdown: true,  items: GALLERY_ITEMS },
  { label: "Join Us",  href: "/join-us",     dropdown: false, items: [] },
];

function NavPillButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center rounded-full text-[11.5px] tracking-[0.16em] uppercase font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        fontFamily: "'Neue World', Georgia, serif",
        fontWeight: 700,
        background: "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
        padding: "9px 22px",
        boxShadow: "0 4px 18px rgba(196,169,106,0.40), inset 0 1px 0 rgba(255,255,255,0.20)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 8px 24px rgba(196,169,106,0.58), inset 0 1px 0 rgba(255,255,255,0.22)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 4px 18px rgba(196,169,106,0.40), inset 0 1px 0 rgba(255,255,255,0.20)";
      }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)" }}
      />
      <span className="relative z-10">{label}</span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const showBranding = pathname !== "/" || scrolled;

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 50);
  });

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(252,249,244,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          borderBottom: scrolled ? "1px solid rgba(196,169,106,0.18)" : "none",
          boxShadow: scrolled ? "0 2px 32px rgba(58,56,50,0.07)" : "none",
        }}
      >
        <div className="w-full px-6 md:px-10 flex items-center h-[66px] md:h-[72px] relative">

          {/* ── LOGO — absolute left edge ─────────────────────────────── */}
          <motion.a
            href="/"
            className="absolute left-6 md:left-10 z-10 flex items-center gap-3"
            animate={{ opacity: showBranding ? 1 : 0, pointerEvents: showBranding ? "auto" : "none" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <img
              src="/hero-logo.png"
              alt="Shear Madness"
              style={{ height: 38, width: "auto", objectFit: "contain" }}
            />
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: scrolled ? "#1A1208" : "#FDFAF6",
              transition: "color 0.5s ease",
              whiteSpace: "nowrap",
            }}>
              Shear <em>Madness</em>
            </span>
          </motion.a>

          {/* ── DESKTOP NAV — glass pill, truly centered ─────────────── */}
          <nav
            className="hidden md:flex items-center gap-6 absolute -translate-x-1/2"
            style={{
              left: "calc(50% - 5.5%)",
              background: scrolled ? "transparent" : "rgba(255,255,255,0.14)",
              backdropFilter: scrolled ? "none" : "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: scrolled ? "none" : "blur(20px) saturate(1.8)",
              border: scrolled ? "1px solid transparent" : "1px solid rgba(255,255,255,0.38)",
              borderRadius: 100,
              boxShadow: scrolled ? "none" : "0 2px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.55)",
              padding: "9px 28px",
              transition: "background 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease",
            }}
          >
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <a
                    href={link.href}
                    className="relative text-[#2C2A25] text-[11.5px] tracking-[0.14em] uppercase font-black transition-colors duration-300 hover:text-[#C4A96A] flex items-center gap-1"
                    style={{ fontFamily: "'Neue World', Georgia, serif", fontWeight: 900 }}
                  >
                    {link.label}
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      className="transition-transform duration-300"
                      style={{ transform: openDropdown === link.label ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>

                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                        style={{ zIndex: 100 }}
                      >
                        <div style={{
                          background: "rgba(252,249,244,0.97)",
                          backdropFilter: "blur(18px) saturate(1.4)",
                          WebkitBackdropFilter: "blur(18px) saturate(1.4)",
                          border: "1px solid rgba(196,169,106,0.22)",
                          borderRadius: 10,
                          boxShadow: "0 12px 40px rgba(58,56,50,0.12), 0 2px 8px rgba(58,56,50,0.06)",
                          padding: "8px 0",
                          minWidth: 180,
                        }}>
                          <div style={{ height: 2, background: "linear-gradient(to right, transparent, rgba(196,169,106,0.50), transparent)", marginBottom: 4 }} />
                          {link.items.map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              className="block text-[#2C2A25] hover:text-[#C4A96A] hover:bg-[rgba(196,169,106,0.06)] transition-all duration-200"
                              style={{ fontFamily: "'Neue World', Georgia, serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, padding: "10px 20px" }}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative text-[#2C2A25] text-[11.5px] tracking-[0.14em] uppercase font-black transition-colors duration-300 hover:text-[#C4A96A] group"
                  style={{ fontFamily: "'Neue World', Georgia, serif", fontWeight: 900 }}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#C4A96A] transition-all duration-300 group-hover:w-full" />
                </a>
              )
            )}
          </nav>

          {/* ── RIGHT BUTTONS: Contact + Book Now — absolute right edge ─ */}
          <div className="hidden md:flex items-center gap-3 absolute right-6 md:right-10">
            <NavPillButton href="/contact" label="Contact" />
            <NavPillButton href="#booking" label="Book Now" />
          </div>

          {/* ── MOBILE HAMBURGER ──────────────────────────────────────── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            className="md:hidden absolute right-6 z-[60] flex flex-col justify-center gap-[5px] w-6 h-6"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.28 }} className="block h-px w-full bg-[#2C2A25]" />
            <motion.span animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} className="block h-px w-full bg-[#2C2A25]" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.28 }} className="block h-px w-4/5 bg-[#2C2A25]" />
          </button>
        </div>
      </motion.header>

      {/* ── MOBILE MENU ───────────────────────────────────────────────── */}
      <motion.div
        initial={false}
        animate={menuOpen ? { opacity: 1, pointerEvents: "auto" as const } : { opacity: 0, pointerEvents: "none" as const }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
        style={{ background: "rgba(250,246,239,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-12 h-px bg-[#C4A96A]/40" />

        <div className="flex flex-col items-center gap-7 mt-8">
          {navLinks.map((link, i) =>
            link.dropdown ? (
              <div key={link.label} className="flex flex-col items-center gap-3">
                <motion.a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  transition={{ duration: 0.38, ease: EASE, delay: 0.05 + i * 0.07 }}
                  className="text-[#2C2A25] hover:text-[#C4A96A] transition-colors duration-300"
                  style={{ fontFamily: "'Neue World', Georgia, serif", fontSize: "clamp(1.7rem, 5vw, 2.4rem)", fontWeight: 300 }}
                >
                  {link.label}
                </motion.a>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={menuOpen ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.38, ease: EASE, delay: 0.05 + i * 0.07 + 0.12 }}
                  className="flex flex-col items-center gap-2"
                >
                  {link.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-sans text-[#3A3832]/55 text-xs tracking-[0.18em] uppercase hover:text-[#C4A96A] transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              </div>
            ) : (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 18 }}
                animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.38, ease: EASE, delay: 0.05 + i * 0.07 }}
                className="text-[#2C2A25] hover:text-[#C4A96A] transition-colors duration-300"
                style={{ fontFamily: "'Neue World', Georgia, serif", fontSize: "clamp(1.7rem, 5vw, 2.4rem)", fontWeight: 300 }}
              >
                {link.label}
              </motion.a>
            )
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.38, ease: EASE, delay: 0.50 }}
            className="flex gap-3"
          >
            <a
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="rounded-full text-[10px] tracking-[0.2em] uppercase text-white px-7 py-3 transition-all duration-300"
              style={{ fontFamily: "'Neue World', Georgia, serif", background: "linear-gradient(135deg, #C9A96E, #B8935A)", boxShadow: "0 4px 18px rgba(196,169,106,0.45)" }}
            >
              Contact
            </a>
            <a
              href="#booking"
              onClick={() => setMenuOpen(false)}
              className="rounded-full text-[10px] tracking-[0.2em] uppercase text-white px-7 py-3 transition-all duration-300"
              style={{ fontFamily: "'Neue World', Georgia, serif", background: "linear-gradient(135deg, #C9A96E, #B8935A)", boxShadow: "0 4px 18px rgba(196,169,106,0.45)" }}
            >
              Book Now
            </a>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
