/**
 * Gravity Forms Web API v1 — read-only connection test
 *
 * Safe: GET only. No entry created. No emails triggered.
 *
 * What this tests:
 *   Four signature variants against GET /gravityformsapi/forms/2/
 *   HTTP 200 = authentication accepted (even if response body is not JSON).
 *   Raw response text is logged before any JSON parsing is attempted.
 *
 * Background (from GF Developer Tools):
 *   The GF-generated URL uses route "forms/2/" (trailing slash).
 *   GF's own tester returns "200: parsererror" — HTTP 200 means auth passed,
 *   "parsererror" just means GF's JS tester couldn't parse the PHP response.
 *   We treat HTTP 200 as a connection + auth success.
 *
 * Run:
 *   npx tsx scripts/test-gravity-web-api.ts
 *
 * Required .env.local:
 *   WP_BASE_URL            https://shearmadnesshoboken.com
 *   GF_FORM_ID             2
 *   GF_PUBLIC_API_KEY      (see Vercel env vars — do not hardcode here)
 *   GF_PRIVATE_API_KEY     (see Vercel env vars — do not hardcode here)
 *   GF_IMPERSONATE_ACCOUNT (see Vercel env vars — do not hardcode here)
 */

import crypto from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
    console.log("✓ .env.local loaded\n");
  } catch {
    console.log("⚠  .env.local not found — using process.env\n");
  }
}

// ── Read env vars ─────────────────────────────────────────────────────────────
function readEnv() {
  const WP_BASE_URL        = (process.env.WP_BASE_URL        ?? "").replace(/\/$/, "");
  const GF_FORM_ID         = process.env.GF_FORM_ID          ?? "2";
  const GF_PUBLIC_API_KEY  = process.env.GF_PUBLIC_API_KEY   ?? "";
  const GF_PRIVATE_API_KEY = process.env.GF_PRIVATE_API_KEY  ?? "";
  const GF_IMPERSONATE     = process.env.GF_IMPERSONATE_ACCOUNT ?? "";

  const missing = (
    [!WP_BASE_URL && "WP_BASE_URL", !GF_PUBLIC_API_KEY && "GF_PUBLIC_API_KEY", !GF_PRIVATE_API_KEY && "GF_PRIVATE_API_KEY"] as (string | false)[]
  ).filter(Boolean) as string[];

  if (missing.length) {
    console.error("✗ Missing env vars:", missing.join(", "));
    process.exit(1);
  }
  return { WP_BASE_URL, GF_FORM_ID, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY, GF_IMPERSONATE };
}

// ── Signature helpers ─────────────────────────────────────────────────────────
// GF Web API v1 — two HMAC variants seen in different GF versions.
//
// 4-part (newer GF):  HMAC-SHA1( private, "public:method:route:expires" )
// 2-part (older GF):  HMAC-SHA1( private, "public:expires" )
//
// Result is base64-encoded and passed as the `signature` query param.
// URLSearchParams handles URL-encoding of base64 special chars (+, /, =).

function hmac(privateKey: string, message: string): string {
  return crypto.createHmac("sha1", privateKey).update(message).digest("base64");
}

function buildUrl(
  base: string,
  route: string,           // e.g. "forms/2" or "forms/2/"
  publicKey: string,
  privateKey: string,
  impersonate: string,
  variant: "4part" | "2part",
  method = "GET",          // UPPERCASE — confirmed by reverse-engineering GF dev tools signature
): string {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const sig =
    variant === "4part"
      ? hmac(privateKey, `${publicKey}:${method}:${route}:${expires}`)
      : hmac(privateKey, `${publicKey}:${expires}`);

  const params = new URLSearchParams({ api_key: publicKey, signature: sig, expires: String(expires) });
  if (impersonate) params.set("impersonate", impersonate);
  return `${base}/gravityformsapi/${route}?${params}`;
}

// ── Single probe ──────────────────────────────────────────────────────────────
async function probe(label: string, url: string): Promise<boolean> {
  console.log(`── ${label}`);
  console.log(`   URL: ${url.split("?")[0]}?api_key=...&signature=...&expires=...`);

  let res: Response;
  try {
    res = await fetch(url, { method: "GET" });
  } catch (err) {
    console.log(`   ✗ Network error: ${err}\n`);
    return false;
  }

  // Log raw text FIRST before any JSON parsing
  const rawText = await res.text();
  console.log(`   HTTP status  : ${res.status} ${res.statusText}`);
  console.log(`   Raw response : ${rawText.slice(0, 400)}${rawText.length > 400 ? "…" : ""}`);

  // Check GF's inner status if the body is JSON.
  // GF wraps its real status inside HTTP 200:
  //   {"status":401,"response":"Permission denied"}  → auth failed
  //   {"status":200,"response":{...}}                → auth passed
  //   non-JSON / PHP serialized / empty              → auth passed (like GF dev tools "parsererror")
  let gfStatus: number | null = null;
  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    if (typeof parsed?.status === "number") {
      gfStatus = parsed.status;
      console.log(`   GF status    : ${gfStatus}`);
    }
  } catch {
    console.log(`   GF status    : (non-JSON body — auth passed, same as GF dev tools "parsererror")`);
  }

  // Pass: HTTP 200 AND (no GF status, OR GF status is not 401/403)
  if (res.status === 200 && (gfStatus === null || (gfStatus !== 401 && gfStatus !== 403))) {
    console.log(`   ✓ AUTH SUCCESS\n`);
    return true;
  }

  if (res.status === 200 && (gfStatus === 401 || gfStatus === 403)) {
    console.log(`   ✗ AUTH REJECTED — GF returned status ${gfStatus} inside HTTP 200\n`);
    return false;
  }

  console.log(`   ✗ FAILED — HTTP ${res.status}\n`);
  return false;
}

// ── Phase 1 ───────────────────────────────────────────────────────────────────
async function runPhase1(env: ReturnType<typeof readEnv>): Promise<boolean> {
  const { WP_BASE_URL, GF_FORM_ID, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY, GF_IMPERSONATE } = env;

  console.log("══════════════════════════════════════════════════════════════");
  console.log("  READ-ONLY TEST — GET forms only, no entry created, no email");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  WP_BASE_URL  : ${WP_BASE_URL}`);
  console.log(`  Form ID      : ${GF_FORM_ID}`);
  console.log(`  Public key   : ${GF_PUBLIC_API_KEY}`);
  console.log(`  Impersonate  : ${GF_IMPERSONATE || "(none)"}`);
  console.log("");

  // Confirmed by reverse-engineering the GF developer tools signature:
  //   signing string = "public_key:GET:forms/2:expires"  (uppercase GET, no trailing slash)
  //
  // The GF dev tools URL has NO impersonate param and returned "parsererror" (auth passed).
  // Our calls WITH impersonate=bkw_admin returned 403 — bkw_admin lacks GF capabilities.
  // We now test without impersonate using the confirmed signing format.

  const routeNoSlash   = `forms/${GF_FORM_ID}`;
  const routeWithSlash = `forms/${GF_FORM_ID}/`;

  const variants: { label: string; url: string }[] = [
    {
      label: "A ★ Confirmed format — 4-part uppercase GET · no trailing slash · NO impersonate",
      url: buildUrl(WP_BASE_URL, routeNoSlash, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY, "", "4part", "GET"),
    },
    {
      label: "B   Confirmed format — 4-part uppercase GET · trailing slash  · NO impersonate",
      url: buildUrl(WP_BASE_URL, routeWithSlash, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY, "", "4part", "GET"),
    },
    {
      label: "C   Confirmed format — 4-part uppercase GET · no trailing slash · WITH impersonate",
      url: buildUrl(WP_BASE_URL, routeNoSlash, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY, GF_IMPERSONATE, "4part", "GET"),
    },
  ];

  const results: { label: string; ok: boolean }[] = [];

  for (const { label, url } of variants) {
    const ok = await probe(label, url);
    results.push({ label, ok });
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════════════");
  for (const { label, ok } of results) {
    console.log(`  ${ok ? "✓ PASS" : "✗ FAIL"}  ${label}`);
  }

  const anyOk = results.some((r) => r.ok);
  if (anyOk) {
    console.log("\n  ✓ At least one method works.");
    if (!process.argv.includes("--submit")) {
      console.log("  → To test a real form submission run:");
      console.log("    npx tsx scripts/test-gravity-web-api.ts --submit");
    }
  } else {
    console.log("\n  ✗ All methods failed.");
    console.log("  → Share the raw response lines above for further diagnosis.");
  }
  console.log("");
  return anyOk;
}

// ── PHASE 2 — Test form submission ────────────────────────────────────────────
// WARNING: Creates a REAL entry in WordPress Form ID 2.
//          WILL trigger notification emails to the salon.
//          Delete the test entry in WP Admin → Forms → Entries afterward.
async function phase2Submit(env: ReturnType<typeof readEnv>): Promise<void> {
  const { WP_BASE_URL, GF_FORM_ID, GF_PUBLIC_API_KEY, GF_PRIVATE_API_KEY } = env;

  console.log("══════════════════════════════════════════════════════════════");
  console.log("  PHASE 2 — Test POST submission");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  ⚠  WILL create 1 real entry in WordPress Form ID:", GF_FORM_ID);
  console.log("  ⚠  WILL trigger notification emails to the salon.");
  console.log("  ⚠  Delete the test entry in WP Admin → Forms → Entries afterward.");
  console.log("");

  // Confirmed signing format: "public_key:POST:route:expires"  (uppercase, no trailing slash)
  const route   = `forms/${GF_FORM_ID}/submissions`;
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const sig     = hmac(GF_PRIVATE_API_KEY, `${GF_PUBLIC_API_KEY}:POST:${route}:${expires}`);
  const params  = new URLSearchParams({ api_key: GF_PUBLIC_API_KEY, signature: sig, expires: String(expires) });
  const url     = `${WP_BASE_URL}/gravityformsapi/${route}?${params}`;

  // Field mapping confirmed by user:
  //   input_11  Name              input_21  First Preferred Date
  //   input_2   Email             input_6   First Appointment Time
  //   input_3   Phone             input_22  Second Preferred Date
  //   input_25  Stylist           input_13  Second Appointment Time
  //   input_30  Service(s)        input_23  Third Preferred Date
  //   input_27  Other Request     input_18  Third Appointment Time
  const payload = {
    input_values: {
      input_11: "TEST USER — IGNORE",
      input_2:  "test@example.com",
      input_3:  "000-000-0000",
      input_25: "No Preference",
      input_30: "Haircut",
      input_21: "2099-12-31",
      input_6:  "10:00 AM",
      input_22: "",
      input_13: "",
      input_23: "",
      input_18: "",
      input_27: "THIS IS A TEST ENTRY — PLEASE DELETE",
    },
  };

  console.log(`  Endpoint : POST ${WP_BASE_URL}/gravityformsapi/${route}`);
  console.log(`  Payload  :`, JSON.stringify(payload, null, 2), "\n");

  let res: Response;
  try {
    res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error("  ✗ Network error:", err);
    return;
  }

  const rawText = await res.text();
  console.log(`  HTTP status  : ${res.status} ${res.statusText}`);
  console.log(`  Raw response : ${rawText}`);

  let gfStatus: number | null = null;
  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    if (typeof parsed?.status === "number") gfStatus = parsed.status;
  } catch { /* non-JSON */ }

  console.log("");
  if (res.status === 200 && (gfStatus === 200 || gfStatus === null)) {
    console.log("  ✓ SUCCESS — Entry created in WordPress.");
    console.log(`  → Check WP Admin → Forms → Entries → Form ${GF_FORM_ID} to confirm.`);
    console.log("  → Delete the test entry manually.");
    console.log("  → Notification emails were sent — inform the salon it was a test.");
  } else if (gfStatus === 400) {
    console.log("  ✗ 400 Bad Request — field mapping or payload issue.");
  } else if (gfStatus === 401) {
    console.log("  ✗ 401 — POST signature rejected. Check signing string.");
  } else if (gfStatus === 403) {
    console.log("  ✗ 403 Forbidden — user capability issue on POST.");
  } else {
    console.log(`  ? Unexpected: HTTP ${res.status}, GF ${gfStatus}.`);
  }
  console.log("");
}

// ── Entry point ───────────────────────────────────────────────────────────────
(async () => {
  loadEnvLocal();
  const env = readEnv();
  const phase1Ok = await runPhase1(env);

  if (process.argv.includes("--submit")) {
    if (!phase1Ok) {
      console.log("  ⚠  Skipping Phase 2 — fix Phase 1 first.\n");
    } else {
      await phase2Submit(env);
    }
  }
})();
