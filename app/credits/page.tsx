import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Credits | Shear Madness Hoboken",
  description: "With gratitude to everyone who helped make Shear Madness what it is.",
};

export default function CreditsPage() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: "100svh",
        backgroundImage: "url('/credits-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
        padding: "clamp(110px, 15vh, 150px) clamp(24px, 8vw, 96px) clamp(72px, 10vh, 100px)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(236,234,231,0.70)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <header style={{ textAlign: "center", marginBottom: "clamp(48px, 7vh, 72px)" }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.62rem", fontWeight: 500,
              letterSpacing: "0.30em", textTransform: "uppercase",
              color: "#C6A76B", marginBottom: 10,
            }}>
              With Gratitude
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              fontWeight: 600, lineHeight: 1.05,
              letterSpacing: "0.01em", color: "#556B2F",
              marginBottom: 20,
            }}>
              Credits for{" "}
              <em style={{ fontWeight: 300 }}>Shear Madness</em>
            </h1>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(198,167,107,0.65))" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
              <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(198,167,107,0.65))" }} />
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
              fontWeight: 400, fontStyle: "italic",
              lineHeight: 1.7, color: "#3A3832",
              maxWidth: 560, margin: "0 auto",
              textAlign: "justify",
            }}>
              Let's give credit where credit is due. Without the following people,
              there would be no Shear Madness — website or otherwise.
            </p>
          </header>

          {/* ── SECTIONS ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            <CreditSection
              label="Our Clients"
              heading="The Heart of Everything"
              body="To every client who has walked through our doors — thank you for your continued loyalty and support. A special thank you to those who graciously allowed us to feature their photos in our gallery, and to those who offered feedback and shared ideas during the creation of this site. You shape who we are."
            />

            <CreditSection
              label="Industry Representatives"
              heading="Our Guiding Partners"
              body="To our industry representatives who stood by us before our doors even opened — your guidance, education, and belief in us have been invaluable. You've helped us grow, endure, and stay at the forefront of our craft by providing the most advanced professional products in the industry. We are grateful for every step you've walked alongside us."
            />

            <CreditSection
              label="A Special Mention"
              heading="Our Friend Bob"
              body="To our dear friend Bob — without your unwavering support and encouragement, Shear Madness simply would not exist. Your belief in us made all the difference."
            />

            <CreditSection
              label="Artists & Stylists"
              heading="Those Who Built With Us"
              body="To every artist and stylist who has been part of the Shear Madness team over the years — your talent, professionalism, and friendship have left a lasting mark. Your success is our success, and we celebrate your growth whether you are still under our roof or have moved on to new adventures. You will always have a place in the Shear Madness story."
            />

            <CreditSection
              label="Social Media"
              heading="Our Nephew, Paul Aldrin"
              body="To our nephew Paul Aldrin, based in the Philippines — thank you for setting up our social media presence and for continuing to manage and grow it with such dedication. Your support from across the miles means the world to us."
            />

            <CreditSection
              label="A Heartfelt Thank You"
              heading="To Everyone Who Has Touched Our Lives"
              body="To each and every person who has been part of our journey — professionally and personally — we thank you from the bottom of our hearts. You are the reason we do what we do, and we are deeply grateful."
            />

          </div>

          {/* ── CLOSING MESSAGE ─────────────────────────────────────────── */}
          <div style={{
            marginTop: "clamp(48px, 7vh, 72px)",
            padding: "clamp(28px, 4vw, 44px) clamp(24px, 4vw, 44px)",
            background: "rgba(198,167,107,0.07)",
            border: "1px solid rgba(198,167,107,0.28)",
            borderRadius: 12,
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.60rem", fontWeight: 600,
              letterSpacing: "0.26em", textTransform: "uppercase",
              color: "#C6A76B", marginBottom: 14,
            }}>
              To Those Yet to Visit
            </p>
            <blockquote style={{ margin: 0 }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.2rem, 2.2vw, 1.55rem)",
                fontWeight: 500, fontStyle: "italic",
                lineHeight: 1.7, color: "#2C2A25",
                letterSpacing: "0.01em", textAlign: "justify",
              }}>
                "Welcome. You may enter a stranger — but you will leave as part of the Shear Madness family."
              </p>
            </blockquote>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
              <a
                href="/#booking"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem", fontWeight: 500,
                  letterSpacing: "0.20em", textTransform: "uppercase",
                  color: "#C6A76B", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                Feel the Madness
                <span style={{ fontSize: "0.8rem" }}>→</span>
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

// ── CREDIT SECTION COMPONENT ─────────────────────────────────────────────────
function CreditSection({
  label,
  heading,
  body,
}: {
  label: string;
  heading: string;
  body: string;
}) {
  return (
    <section style={{
      borderTop: "1px solid rgba(198,167,107,0.24)",
      padding: "clamp(28px, 4vh, 40px) 0",
    }}>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.58rem", fontWeight: 600,
        letterSpacing: "0.26em", textTransform: "uppercase",
        color: "#C6A76B", marginBottom: 8,
      }}>
        {label}
      </p>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
        fontWeight: 600, lineHeight: 1.15,
        letterSpacing: "0.01em", color: "#556B2F",
        marginBottom: 14,
      }}>
        {heading}
      </h2>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(0.92rem, 1.05vw, 1.0rem)",
        fontWeight: 400, lineHeight: 1.82,
        color: "#3A3832", letterSpacing: "0.012em",
        textAlign: "justify",
      }}>
        {body}
      </p>
    </section>
  );
}
