import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ── Allowlists ────────────────────────────────────────────────────────────────
const ALLOWED_STYLISTS = new Set([
  "No Preference", "George Fraggos", "Oscar Victor",
]);
const ALLOWED_SERVICES = new Set([
  "Haircut", "Girl Child Cut", "Blowout", "Eyebrow Wax", "Updo",
  "Single Process Colour", "Highlights Panel", "Highlights: Partial / Full",
  "Color Correction", "Color Glazing", "Permanent Wave", "Extensions",
  "Hair Cut", "Boy Child Cut", "Single Process", "Relaxer", "Highlights",
  "Intensive Conditioning Treatment", "Tandem Texture Treatment",
  "Brazilian Keratin Treatment", "Japanese Relaxer",
]);

// ── Rate limiter (in-memory, per IP, 5 req / 60 s) ───────────────────────────
// Note: Vercel may run multiple function instances; this limits bursts
// within one instance. Effective against naive bots; not a distributed solution.
const rlMap = new Map<string, { count: number; reset: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || now > entry.reset) { rlMap.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function strip(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-()+.]{7,20}$/;

// ── 405 for every method except POST ─────────────────────────────────────────
export async function GET()    { return NextResponse.json({ error: "Method not allowed." }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: "Method not allowed." }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: "Method not allowed." }, { status: 405 }); }
export async function PATCH()  { return NextResponse.json({ error: "Method not allowed." }, { status: 405 }); }

// ── POST /api/booking ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Body size guard (16 KB is far more than enough)
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  const WP_BASE_URL    = (process.env.WP_BASE_URL        ?? "").replace(/\/$/, "");
  const GF_FORM_ID     = process.env.GF_FORM_ID           ?? "2";
  const GF_PUBLIC_KEY  = process.env.GF_PUBLIC_API_KEY    ?? "";
  const GF_PRIVATE_KEY = process.env.GF_PRIVATE_API_KEY   ?? "";

  if (!WP_BASE_URL || !GF_PUBLIC_KEY || !GF_PRIVATE_KEY) {
    console.error("[booking] Missing env vars");
    return NextResponse.json(
      { error: "Server configuration error. Please call us to book your appointment." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — real users leave this blank; bots fill it
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  // Parse + strip HTML from all user inputs
  const name    = strip(String(body.name    ?? ""));
  const email   = strip(String(body.email   ?? ""));
  const phone   = strip(String(body.phone   ?? ""));
  const stylist = strip(String(body.stylist ?? "No Preference"));
  const notes   = strip(String(body.notes   ?? ""));

  const dates = Array.isArray(body.dates)
    ? (body.dates as string[]).slice(0, 3).map((s) => strip(String(s)))
    : ["", "", ""];
  const times = Array.isArray(body.times)
    ? (body.times as string[]).slice(0, 3).map((s) => strip(String(s)))
    : ["", "", ""];
  const rawServices = Array.isArray(body.services) ? (body.services as string[]) : [];

  // Required fields
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 422 });
  }

  // Length limits
  if (name.length  > 100)  return NextResponse.json({ error: "Name is too long."   }, { status: 422 });
  if (email.length > 254)  return NextResponse.json({ error: "Email is too long."  }, { status: 422 });
  if (notes.length > 1000) return NextResponse.json({ error: "Notes are too long." }, { status: 422 });

  // Format validation
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number (digits, spaces, dashes, parentheses)." }, { status: 422 });
  }

  // Allowlist validation — unknown values are dropped, not forwarded to GF
  const safeStylest  = ALLOWED_STYLISTS.has(stylist) ? stylist : "No Preference";
  const safeServices = rawServices
    .map((s) => strip(String(s)))
    .filter((s) => ALLOWED_SERVICES.has(s));

  const input_values = {
    input_11: name,
    input_2:  email,
    input_3:  phone,
    input_25: safeStylest,
    input_30: safeServices.join(", "),
    input_21: dates[0] ?? "",
    input_6:  times[0] ?? "",
    input_22: dates[1] ?? "",
    input_13: times[1] ?? "",
    input_23: dates[2] ?? "",
    input_18: times[2] ?? "",
    input_27: notes,
  };

  // HMAC-SHA1 signing — identical to confirmed working format
  const route     = `forms/${GF_FORM_ID}/submissions`;
  const expires   = Math.floor(Date.now() / 1000) + 3600;
  const signature = crypto
    .createHmac("sha1", GF_PRIVATE_KEY)
    .update(`${GF_PUBLIC_KEY}:POST:${route}:${expires}`)
    .digest("base64");

  const params = new URLSearchParams({ api_key: GF_PUBLIC_KEY, signature, expires: String(expires) });
  const gfUrl  = `${WP_BASE_URL}/gravityformsapi/${route}?${params}`;

  let gfRes: Response;
  try {
    gfRes = await fetch(gfUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ input_values }),
    });
  } catch {
    console.error("[booking] Network error reaching GF");
    return NextResponse.json(
      { error: "Could not reach the booking system. Please call us to book your appointment." },
      { status: 502 },
    );
  }

  let gfData: Record<string, unknown>;
  try {
    gfData = await gfRes.json();
  } catch {
    console.error("[booking] GF returned non-JSON");
    return NextResponse.json(
      { error: "Unexpected response from booking system. Please call us to book." },
      { status: 502 },
    );
  }

  const gfStatus   = typeof gfData?.status   === "number" ? gfData.status                                      : 0;
  const gfResponse = typeof gfData?.response === "object" ? (gfData.response as Record<string, unknown>) : null;

  if (gfStatus === 200 && gfResponse?.is_valid === true) {
    return NextResponse.json({ success: true });
  }

  if (gfStatus === 200 && gfResponse?.is_valid === false) {
    console.error("[booking] GF validation failed (status 200, is_valid false)");
    return NextResponse.json(
      { error: "Some fields could not be validated. Please review your details and try again." },
      { status: 422 },
    );
  }

  console.error("[booking] Unexpected GF status:", gfStatus);
  return NextResponse.json(
    { error: "Something went wrong. Please call us to book your appointment." },
    { status: 500 },
  );
}
