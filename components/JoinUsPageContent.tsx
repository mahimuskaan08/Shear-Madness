"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const POSITIONS = [
  "Hair Stylist",
  "Colorist",
  "Assistant Stylist",
  "Salon Coordinator",
  "Other",
];

const STYLES = `
  html, body { overflow-x: hidden; }

  .joi-page {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    background: transparent;
  }

  /* ── TWO-COLUMN LAYOUT ──────────────────────────────── */
  .joi-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: clamp(100px,13vh,140px) clamp(32px,5vw,80px) clamp(48px,6vh,72px);
    gap: clamp(48px,6vw,96px);
    align-items: center;
  }
  @media (max-width: 860px) {
    .joi-grid {
      grid-template-columns: 1fr;
      padding-top: clamp(100px,14vh,130px);
      gap: 40px;
    }
  }

  /* ── INPUTS ─────────────────────────────────────────── */
  .joi-field {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid rgba(0,0,0,0.30);
    padding: 12px 0;
    font-family: 'Inter', sans-serif;
    font-size: clamp(1.0rem, 1.3vw, 1.18rem);
    font-weight: 700;
    color: #000;
    letter-spacing: 0.01em;
    outline: none;
    transition: border-color 0.3s ease;
    border-radius: 0;
    -webkit-appearance: none;
  }
  .joi-field::placeholder {
    color: rgba(0,0,0,0.38);
    font-weight: 400;
  }
  .joi-field:focus {
    border-bottom-color: #C6A76B;
  }
  .joi-select {
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23C6A76B' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 2px center;
    padding-right: 22px;
  }
  .joi-select option { color: #000; background: #FDFAF6; }

  .joi-label {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: #000;
    margin-bottom: 6px;
    transition: color 0.3s;
  }
  .joi-group:focus-within .joi-label { color: #C6A76B; }

  /* ── BUTTON ─────────────────────────────────────────── */
  .joi-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%);
    border: none;
    padding: 14px 48px;
    border-radius: 100px;
    cursor: pointer;
    transition: box-shadow 0.4s ease, transform 0.4s ease;
    box-shadow: 0 4px 22px rgba(198,167,107,0.40);
    width: 100%;
  }
  .joi-submit:hover {
    box-shadow: 0 8px 32px rgba(198,167,107,0.62);
    transform: translateY(-2px);
  }

  /* ── NAME ROW ───────────────────────────────────────── */
  .joi-name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(16px, 2.5vw, 32px);
  }
  @media (max-width: 480px) {
    .joi-name-row { grid-template-columns: 1fr; }
  }
`;

function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", position: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{ textAlign: "center", padding: "40px 0" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ height: 1, width: 36, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.55))" }} />
          <span style={{ color: "#C6A76B", fontSize: "0.68rem" }}>✦</span>
          <div style={{ height: 1, width: 36, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.55))" }} />
        </div>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          fontWeight: 700,
          color: "#556B2F",
          marginBottom: 14,
          lineHeight: 1.2,
        }}>
          Thank you for your interest.
        </h3>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(0.95rem, 1.2vw, 1.08rem)",
          fontStyle: "italic",
          fontWeight: 700,
          color: "rgba(26,18,8,0.55)",
          lineHeight: 1.75,
        }}>
          Our team will review your application and contact you if selected.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,2.6vh,26px)" }}>

      <div className="joi-name-row">
        <div className="joi-group">
          <label className="joi-label">First Name</label>
          <input className="joi-field" name="firstName" type="text" placeholder="First name"
            value={form.firstName} onChange={handleChange} required />
        </div>
        <div className="joi-group">
          <label className="joi-label">Last Name</label>
          <input className="joi-field" name="lastName" type="text" placeholder="Last name"
            value={form.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="joi-group">
        <label className="joi-label">Email Address</label>
        <input className="joi-field" name="email" type="email" placeholder="you@example.com"
          value={form.email} onChange={handleChange} required />
      </div>

      <div className="joi-group">
        <label className="joi-label">Phone Number</label>
        <input className="joi-field" name="phone" type="tel" placeholder="+1 (000) 000-0000"
          value={form.phone} onChange={handleChange} />
      </div>

      <div className="joi-group">
        <label className="joi-label">Position</label>
        <select className="joi-field joi-select" name="position"
          value={form.position} onChange={handleChange} required>
          <option value="" disabled>Select a position</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
        <button type="submit" className="joi-submit">Submit Application</button>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.88rem, 1.05vw, 1.0rem)",
          fontWeight: 700,
          color: "#000",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Or email your résumé to{" "}
          <a href="mailto:info@shearmadnesshoboken.com" style={{
            color: "#000",
            fontWeight: 800,
            textDecoration: "none",
            borderBottom: "2px solid #000",
            paddingBottom: "1px",
            transition: "border-color 0.3s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#C6A76B")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#000")}
          >
            info@shearmadnesshoboken.com
          </a>
        </p>
      </div>

    </form>
  );
}

export default function JoinUsPageContent() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <CustomCursor />
      <Navbar />

      <div className="joi-page">

        {/* Background image */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        }}>
          <img
            src="/join-bg.jpg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          />
          {/* Light wash so text stays legible over the pale painting */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(253,250,246,0.78)" }} />
        </div>

        <div className="joi-grid" style={{ position: "relative", zIndex: 1 }}>

          {/* ── LEFT: TEXT ──────────────────────────────────────────────── */}
          <div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.56rem",
                fontWeight: 700,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "#C6A76B",
                marginBottom: 18,
              }}
            >
              Careers
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.26 }}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(3.0rem, 6.5vw, 5.4rem)",
                fontWeight: 700,
                lineHeight: 1.0,
                letterSpacing: "0.01em",
                color: "#000",
                marginBottom: 22,
              }}
            >
              <span style={{ color: "#556B2F" }}>Join</span> Our<br /><em>Team</em>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.40 }}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, transformOrigin: "left" }}
            >
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", flexShrink: 0 }} />
              <div style={{ height: 1, width: 52, background: "linear-gradient(to right, rgba(198,167,107,0.65), transparent)" }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.50 }}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.25rem, 2.0vw, 1.55rem)",
                fontStyle: "italic",
                fontWeight: 700,
                color: "#556B2F",
                lineHeight: 1.78,
                marginBottom: 28,
              }}
            >
              Be part of a salon built on precision, creativity, and craftsmanship.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.62 }}
              style={{
                borderLeft: "3px solid #C6A76B",
                paddingLeft: 20,
              }}
            >
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.1rem, 1.55vw, 1.30rem)",
                fontWeight: 700,
                color: "#556B2F",
                lineHeight: 1.78,
                letterSpacing: "0.01em",
              }}>
                Learn with a perfectionist — alongside{" "}
                <strong style={{ fontWeight: 800 }}>Oscar Victor</strong>,
                bringing over{" "}
                <strong style={{ fontWeight: 800 }}>35 years</strong>{" "}
                of experience in the art of hair.
              </p>
            </motion.div>

          </div>

          {/* ── RIGHT: FORM ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.30 }}
          >
            {/* Form heading */}
            <div style={{ marginBottom: "clamp(22px,3.2vh,32px)" }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.56rem",
                fontWeight: 700,
                letterSpacing: "0.36em",
                textTransform: "uppercase",
                color: "#C6A76B",
                marginBottom: 8,
              }}>
                Apply Now
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.8rem, 3.0vw, 2.6rem)",
                fontWeight: 700,
                color: "#000",
                letterSpacing: "0.01em",
                lineHeight: 1.15,
                marginBottom: 10,
              }}>
                We&apos;d Love to Meet You
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(0.88rem, 1.1vw, 1.02rem)",
                fontWeight: 700,
                color: "#556B2F",
                lineHeight: 1.65,
              }}>
                We&apos;re always looking for passionate individuals who value detail, care, and excellence.
              </p>
            </div>

            <ApplicationForm />
          </motion.div>

        </div>
      </div>
    </>
  );
}
