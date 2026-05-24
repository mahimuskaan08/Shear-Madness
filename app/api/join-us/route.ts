import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const WP_BASE_URL    = (process.env.WP_BASE_URL        ?? "").replace(/\/$/, "");
  const GF_FORM_ID     = process.env.GF_JOIN_FORM_ID      ?? "4";
  const GF_PUBLIC_KEY  = process.env.GF_PUBLIC_API_KEY    ?? "";
  const GF_PRIVATE_KEY = process.env.GF_PRIVATE_API_KEY   ?? "";

  if (!WP_BASE_URL || !GF_PUBLIC_KEY || !GF_PRIVATE_KEY) {
    console.error("[join-us] Missing GF env vars");
    return NextResponse.json(
      { error: "Server configuration error. Please email us to apply." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName  = String(body.lastName  ?? "").trim();
  const email     = String(body.email     ?? "").trim();
  const phone     = String(body.phone     ?? "").trim();
  const position  = String(body.position  ?? "").trim();

  if (!firstName || !lastName || !email || !phone || !position) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 422 },
    );
  }

  const input_values = {
    input_1: firstName,
    input_2: lastName,
    input_5: email,
    input_6: phone,
    input_7: position,
  };

  // Identical signing method to the working booking integration:
  // HMAC-SHA1(private_key, "public_key:POST:route:expires") — uppercase, no trailing slash
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
  } catch (err) {
    console.error("[join-us] Network error reaching GF:", err);
    return NextResponse.json(
      { error: "Could not reach the application system. Please email us to apply." },
      { status: 502 },
    );
  }

  let gfData: Record<string, unknown>;
  try {
    gfData = await gfRes.json();
  } catch {
    console.error("[join-us] GF returned non-JSON response");
    return NextResponse.json(
      { error: "Unexpected response from application system. Please email us to apply." },
      { status: 502 },
    );
  }

  const gfStatus   = typeof gfData?.status   === "number" ? gfData.status                                      : 0;
  const gfResponse = typeof gfData?.response === "object" ? (gfData.response as Record<string, unknown>) : null;

  if (gfStatus === 200 && gfResponse?.is_valid === true) {
    return NextResponse.json({ success: true });
  }

  if (gfStatus === 200 && gfResponse?.is_valid === false) {
    console.error("[join-us] GF validation errors:", gfResponse);
    return NextResponse.json(
      { error: "Some fields could not be validated. Please review your details and try again." },
      { status: 422 },
    );
  }

  console.error("[join-us] Unexpected GF status:", gfStatus, gfData);
  return NextResponse.json(
    { error: "Something went wrong. Please email us to apply." },
    { status: 500 },
  );
}
