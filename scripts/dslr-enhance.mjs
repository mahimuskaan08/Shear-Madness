import sharp from "sharp";
import { readFileSync } from "fs";

// ── Paths ────────────────────────────────────────────────────────────────────
const IMAGES = [
  {
    input:  "C:/Users/mahi0/Downloads/Gemini_Generated_Image_lcowvrlcowvrlcow.png",
    output: "C:/Users/mahi0/Downloads/enhanced-portrait-1.jpg",
    label:  "Street portrait",
    // Face sits roughly in the upper-centre; body fills the lower half
    focusCy: 38,   // focal centre Y (%) — slightly above mid for face
    focusCx: 50,   // focal centre X (%)
    focusR:  48,   // gradient radius (%) — how wide the sharp zone is
    bokehSigma: 14, // background blur strength
  },
  {
    input:  "C:/Users/mahi0/Downloads/Gemini_Generated_Image_4dewsl4dewsl4dew.png",
    output: "C:/Users/mahi0/Downloads/enhanced-portrait-2.jpg",
    label:  "Car portrait",
    focusCy: 42,
    focusCx: 50,
    focusR:  46,
    bokehSigma: 16,
  },
];

async function buildFocusMask(width, height, cx, cy, r) {
  // Radial SVG gradient: white = sharp zone, black = blur zone
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="m" cx="${cx}%" cy="${cy}%" r="${r}%"
                      fx="${cx}%" fy="${cy}%">
        <stop offset="0%"   stop-color="white" stop-opacity="1"/>
        <stop offset="55%"  stop-color="white" stop-opacity="1"/>
        <stop offset="80%"  stop-color="white" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="black" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#m)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function enhancePortrait(cfg) {
  console.log(`\n→ Processing: ${cfg.label}`);

  const { width, height } = await sharp(cfg.input).metadata();
  console.log(`  Dimensions: ${width} × ${height}`);

  // ── 1. Enhanced / sharpened subject layer ───────────────────────────────
  // Professional sharpening (unsharp mask style): accentuate fine detail on
  // face, hair, fabric without halos.  Slight contrast lift + warmth.
  const enhancedBuf = await sharp(cfg.input)
    // Luminosity sharpening — crisp but natural
    .sharpen({ sigma: 0.9, m1: 1.4, m2: 0.6, x1: 2, y2: 12, y3: 22 })
    // Contrast lift: input range [0..255] → output [0..255] with lifted mids
    .linear(1.07, -6)
    // Saturation +15 % for true-to-life color, warmth +3° (golden hour shift)
    .modulate({ brightness: 1.015, saturation: 1.15, hue: 3 })
    // Gentle gamma correction for open shadows (DSLR sensor characteristic)
    .gamma(1.08)
    .toBuffer();

  // ── 2. Bokeh / background layer ─────────────────────────────────────────
  // Gaussian blur mimics f/1.8 shallow depth-of-field on background.
  // Slightly boost saturation so OOF colours stay rich, not washed out.
  const bokehBuf = await sharp(cfg.input)
    .blur(cfg.bokehSigma)
    .linear(1.04, -3)
    .modulate({ saturation: 1.10 })
    .toBuffer();

  // ── 3. Focus mask (radial gradient alpha) ───────────────────────────────
  const maskBuf = await buildFocusMask(
    width, height,
    cfg.focusCx, cfg.focusCy, cfg.focusR,
  );

  // ── 4. Apply mask to enhanced layer as alpha ────────────────────────────
  // dest-in: keeps enhanced pixels where mask is opaque, punches through
  // to transparent where mask is black → those areas show bokeh below.
  const maskedEnhanced = await sharp(enhancedBuf)
    .ensureAlpha()
    .composite([{ input: maskBuf, blend: "dest-in" }])
    .toBuffer();

  // ── 5. Composite sharp subject over blurred background ──────────────────
  await sharp(bokehBuf)
    .composite([{ input: maskedEnhanced, blend: "over" }])
    // DSLR-quality JPEG — 98 quality, 4:4:4 chroma, no subsampling artefacts
    .jpeg({ quality: 98, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(cfg.output);

  console.log(`  ✓ Saved → ${cfg.output}`);
}

// ── Run ──────────────────────────────────────────────────────────────────────
for (const cfg of IMAGES) {
  await enhancePortrait(cfg);
}
console.log("\nAll done.");
