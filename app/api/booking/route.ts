import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // All secrets live server-side — never reach the browser
  const WP_BASE_URL    = (process.env.WP_BASE_URL        ?? "").replace(/\/$/, "");
  const GF_FORM_ID     = process.env.GF_FORM_ID           ?? "2";
  const GF_PUBLIC_KEY  = process.env.GF_PUBLIC_API_KEY    ?? "";
  const GF_PRIVATE_KEY = process.env.GF_PRIVATE_API_KEY   ?? "";

  if (!WP_BASE_URL || !GF_PUBLIC_KEY || !GF_PRIVATE_KEY) {
    console.error("[booking] Missing GF env vars");
    return NextResponse.json(
      { error: "Server configuration error. Please call us to book your appointment." },
      { status: 500 },
    );
  }

  // Parse request body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name     = String(body.name     ?? "").trim();
  const email    = String(body.email    ?? "").trim();
  const phone    = String(body.phone    ?? "").trim();
  const stylist  = String(body.stylist  ?? "No Preference").trim();
  const notes    = String(body.notes    ?? "").trim();
  const dates    = Array.isArray(body.dates)    ? (body.dates    as string[]) : ["", "", ""];
  const times    = Array.isArray(body.times)    ? (body.times    as string[]) : ["", "", ""];
  const services = Array.isArray(body.services) ? (body.services as string[]) : [];

  // Server-side required field guard (client validates too — this is the safety net)
  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 422 },
    );
  }

  // Map form fields to confirmed Gravity Forms input IDs
  const input_values = {
    input_11: name,
    input_2:  email,
    input_3:  phone,
    input_25: stylist,
    input_30: services.join(", "),  // comma-separated service list
    input_21: dates[0] ?? "",       // first preferred date
    input_6:  times[0] ?? "",       // first appointment time
    input_22: dates[1] ?? "",       // second preferred date
    input_13: times[1] ?? "",       // second appointment time
    input_23: dates[2] ?? "",       // third preferred date
    input_18: times[2] ?? "",       // third appointment time
    input_27: notes,
  };

  // Build signed GF Web API v1 URL
  // Confirmed format: HMAC-SHA1( private_key, "public_key:POST:route:expires" )
  //   - Method uppercase: POST
  //   - Route without trailing slash: forms/2/submissions
  const route     = `forms/${GF_FORM_ID}/submissions`;
  const expires   = Math.floor(Date.now() / 1000) + 3600;
  const signature = crypto
    .createHmac("sha1", GF_PRIVATE_KEY)
    .update(`${GF_PUBLIC_KEY}:POST:${route}:${expires}`)
    .digest("base64");

  const params = new URLSearchParams({ api_key: GF_PUBLIC_KEY, signature, expires: String(expires) });
  const gfUrl  = `${WP_BASE_URL}/gravityformsapi/${route}?${params}`;

  // Submit to Gravity Forms
  let gfRes: Response;
  try {
    gfRes = await fetch(gfUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ input_values }),
    });
  } catch (err) {
    console.error("[booking] Network error reaching GF:", err);
    return NextResponse.json(
      { error: "Could not reach the booking system. Please call us to book your appointment." },
      { status: 502 },
    );
  }

  let gfData: Record<string, unknown>;
  try {
    gfData = await gfRes.json();
  } catch {
    console.error("[booking] GF returned non-JSON response");
    return NextResponse.json(
      { error: "Unexpected response from booking system. Please call us to book." },
      { status: 502 },
    );
  }

  const gfStatus   = typeof gfData?.status   === "number" ? gfData.status                            : 0;
  const gfResponse = typeof gfData?.response === "object" ? (gfData.response as Record<string, unknown>) : null;

  if (gfStatus === 200 && gfResponse?.is_valid === true) {
    return NextResponse.json({ success: true });
  }

  if (gfStatus === 200 && gfResponse?.is_valid === false) {
    console.error("[booking] GF validation errors:", gfResponse);
    return NextResponse.json(
      { error: "Some fields could not be validated. Please review your details and try again." },
      { status: 422 },
    );
  }

  console.error("[booking] Unexpected GF status:", gfStatus, gfData);
  return NextResponse.json(
    { error: "Something went wrong. Please call us to book your appointment." },
    { status: 500 },
  );
}
