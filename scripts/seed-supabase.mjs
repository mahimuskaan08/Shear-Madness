/**
 * Seeds Supabase with all hardcoded site data.
 * Run with: node --env-file=.env.local scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Portfolio images ──────────────────────────────────────────────────────────
const GALLERY = [
  // Men
  { order: 1,  url: "/gallery/m1-full.jpeg",  alt: "Men Style 1",  category: "men" },
  { order: 2,  url: "/gallery/m2-full.jpg",   alt: "Men Style 2",  category: "men" },
  { order: 3,  url: "/gallery/m3-full.jpeg",  alt: "Men Style 3",  category: "men" },
  { order: 4,  url: "/gallery/m4-full.jpg",   alt: "Men Style 4",  category: "men" },
  { order: 5,  url: "/gallery/m5-full.jpeg",  alt: "Men Style 5",  category: "men" },
  { order: 6,  url: "/gallery/m6-full.jpeg",  alt: "Men Style 6",  category: "men" },
  { order: 7,  url: "/gallery/m7-full.jpeg",  alt: "Men Style 7",  category: "men" },
  { order: 8,  url: "/gallery/m8-full.jpeg",  alt: "Men Style 8",  category: "men" },
  { order: 9,  url: "/gallery/m9-full.jpeg",  alt: "Men Style 9",  category: "men" },
  { order: 10, url: "/gallery/m10-full.jpeg", alt: "Men Style 10", category: "men" },
  { order: 11, url: "/gallery/m11-full.jpeg", alt: "Men Style 11", category: "men" },
  { order: 12, url: "/gallery/m12-full.jpeg", alt: "Men Style 12", category: "men" },
  { order: 13, url: "/gallery/m13-full.jpeg", alt: "Men Style 13", category: "men" },
  { order: 14, url: "/gallery/m14-full.jpeg", alt: "Men Style 14", category: "men" },
  { order: 15, url: "/gallery/m15-full.jpeg", alt: "Men Style 15", category: "men" },
  { order: 16, url: "/gallery/m16-full.jpeg", alt: "Men Style 16", category: "men" },
  { order: 17, url: "/gallery/m17-full.jpeg", alt: "Men Style 17", category: "men" },
  { order: 18, url: "/gallery/m18-full.jpeg", alt: "Men Style 18", category: "men" },
  { order: 19, url: "/gallery/m19-full.jpeg", alt: "Men Style 19", category: "men" },
  { order: 20, url: "/gallery/m20-full.jpeg", alt: "Men Style 20", category: "men" },
  { order: 21, url: "/gallery/m21-full.png",  alt: "Men Style 21", category: "men" },
  { order: 22, url: "/gallery/m22-full.jpg",  alt: "Men Style 22", category: "men" },
  { order: 23, url: "/gallery/m23-full.jpg",  alt: "Men Style 23", category: "men" },
  { order: 24, url: "/gallery/m24-full.jpg",  alt: "Men Style 24", category: "men" },
  { order: 25, url: "/gallery/m25-full.jpg",  alt: "Men Style 25", category: "men" },
  { order: 26, url: "/gallery/m26-full.png",  alt: "Men Style 26", category: "men" },
  { order: 27, url: "/gallery/m27-full.jpg",  alt: "Men Style 27", category: "men" },
  { order: 28, url: "/gallery/m28-full.jpeg", alt: "Men Style 28", category: "men" },
  { order: 29, url: "/gallery/m29-full.jpg",  alt: "Men Style 29", category: "men" },
  { order: 30, url: "/gallery/m30-full.jpg",  alt: "Men Style 30", category: "men" },
  { order: 31, url: "/gallery/m31-full.jpg",  alt: "Men Style 31", category: "men" },
  { order: 32, url: "/gallery/m32-full.jpg",  alt: "Men Style 32", category: "men" },
  { order: 33, url: "/gallery/m33-full.jpg",  alt: "Men Style 33", category: "men" },
  { order: 34, url: "/gallery/m34-full.jpg",  alt: "Men Style 34", category: "men" },
  { order: 35, url: "/gallery/m35-full.jpg",  alt: "Men Style 35", category: "men" },
  { order: 36, url: "/gallery/m36-full.jpg",  alt: "Men Style 36", category: "men" },
  { order: 37, url: "/gallery/m37-full.jpg",  alt: "Men Style 37", category: "men" },
  { order: 38, url: "/gallery/m38-full.jpg",  alt: "Men Style 38", category: "men" },
  { order: 39, url: "/gallery/m39-full.jpg",  alt: "Men Style 39", category: "men" },
  { order: 40, url: "/gallery/m40-full.png",  alt: "Men Style 40", category: "men" },
  // Women
  { order: 1,  url: "/gallery/w1-full.jpg",  alt: "Women Style 1",  category: "women" },
  { order: 2,  url: "/gallery/w2-full.png",  alt: "Women Style 2",  category: "women" },
  { order: 3,  url: "/gallery/w3-full.jpg",  alt: "Women Style 3",  category: "women" },
  { order: 4,  url: "/gallery/w4-full.jpg",  alt: "Women Style 4",  category: "women" },
  { order: 5,  url: "/gallery/w5-full.jpg",  alt: "Women Style 5",  category: "women" },
  { order: 6,  url: "/gallery/w6-full.jpg",  alt: "Women Style 6",  category: "women" },
  { order: 7,  url: "/gallery/w7-full.jpg",  alt: "Women Style 7",  category: "women" },
  { order: 8,  url: "/gallery/w8-full.jpg",  alt: "Women Style 8",  category: "women" },
  { order: 9,  url: "/gallery/w9-full.jpg",  alt: "Women Style 9",  category: "women" },
  { order: 10, url: "/gallery/w10-full.jpg", alt: "Women Style 10", category: "women" },
  { order: 11, url: "/gallery/w11-full.jpg", alt: "Women Style 11", category: "women" },
  { order: 12, url: "/gallery/w12-full.jpg", alt: "Women Style 12", category: "women" },
  { order: 13, url: "/gallery/w13-full.jpg", alt: "Women Style 13", category: "women" },
  { order: 14, url: "/gallery/w14-full.jpg", alt: "Women Style 14", category: "women" },
  { order: 15, url: "/gallery/w15-full.png", alt: "Women Style 15", category: "women" },
  { order: 16, url: "/gallery/w16-full.jpg", alt: "Women Style 16", category: "women" },
  { order: 17, url: "/gallery/w17-full.jpg", alt: "Women Style 17", category: "women" },
  { order: 18, url: "/gallery/w18-full.jpg", alt: "Women Style 18", category: "women" },
  // Hair & Makeup (stored as "both" — closest available category)
  { order: 1,  url: "/gallery/hm1-full.jpg", alt: "Hair & Makeup 1", category: "both" },
  { order: 2,  url: "/gallery/hm2-full.jpg", alt: "Hair & Makeup 2", category: "both" },
  { order: 3,  url: "/gallery/hm3-full.jpg", alt: "Hair & Makeup 3", category: "both" },
  { order: 4,  url: "/gallery/hm4-full.png", alt: "Hair & Makeup 4", category: "both" },
  { order: 5,  url: "/gallery/hm5-full.jpg", alt: "Hair & Makeup 5", category: "both" },
]

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Verified Reviewer",   text: "I love this place. Right when you walk in, you are always greeted by David, who is super friendly and welcoming. Victor is the absolute best. He takes his time and is meticulous with his cuts/styling. I highly recommend you give this place a try :)" },
  { name: "Michelle Ferran",     text: "OMG I had my first haircut from Victor — what an amazing experience!!! Not only did I get a fabulous haircut, Victor took the time to talk me through my new style. He showed me how to style it with his hair products." },
  { name: "Bradley Paszkiewicz", text: "Honestly the best haircut I have ever gotten. Victor has an absolutely amazing personality that makes the whole experience fun, plus super experienced. He explains everything he is doing/about to do and why." },
  { name: "Ángeles González",    text: "Today my boyfriend went to this place to get his hair cut. He received what we believe is the best haircut he's ever had, so I had to come here to say THANK YOU." },
  { name: "Henna Vora",          text: "I love my husband's haircut and styling. Victor is professional and excellent at his job. Brilliant skill set to handle my husband's hair volumes. Big thank you." },
  { name: "Gregory G.",          text: "The 2 owner operators are always on-site, so the well run, full service shop is always fully stocked, staffed, and maintained. David and Viktor space appointments that they can actually honor." },
  { name: "Saarth Shah",         text: "Best haircut place in town. Victor is amazing at knowing the hair style you want and has some great suggestions. David is very nice and friendly." },
  { name: "G Bha",               text: "Love the edgy cuts Victor does! He always takes the time to make sure it's cut and styled well. I've tried different hair salons both in Hoboken and New York City but Shear Madness is a cut above all of them!" },
  { name: "Jaime Zimmel",        text: "David and Victor are always on-site, and always very accommodating and professional. The site is always well maintained and clean. They always make the experience very warm and welcoming." },
  { name: "Jesse Luo",           text: "Met with Victor, he was very patient with me in building up a better haircut than my usual, and explained all his recommendations in detail. Highly recommended and worth a trip." },
  { name: "Andrew Lazirko",      text: "My first haircut at a new salon in 28 years. Absolute legends in here. 10/10 would recommend to everyone. Class act establishment. My new spot for sure." },
  { name: "Erdal Turnacioglu",   text: "I've been going to Victor for over 15 years now, no matter where I've lived and worked in New York or New Jersey. He's the best! Highly recommend!" },
  { name: "Brad Mundt",          text: "Excellent cut by Victor. I appreciate his explanations as to why he is doing certain things and his overall skill level." },
  { name: "Georgiy Yudintsev",   text: "Excellent haircut, a little pricey but it was very well done. Very chill and easy going staff too!" },
  { name: "Daniel Mikus",        text: "I love this place! Even after moving to Brooklyn I still make the journey across both rivers monthly to get my hair cut." },
]

// ── Run ───────────────────────────────────────────────────────────────────────

// 1. Portfolio images
console.log("Seeding portfolio images...")
await supabase.from("portfolio_images").delete().neq("id", "00000000-0000-0000-0000-000000000000")
const portfolioRows = GALLERY.map((g) => ({
  url: g.url, path: g.url, alt: g.alt, title: g.alt,
  category: g.category, featured: g.order <= 6, display_order: g.order,
}))
const { error: portfolioErr } = await supabase.from("portfolio_images").insert(portfolioRows)
if (portfolioErr) console.error("  ERROR:", portfolioErr.message)
else console.log(`  ✓ ${portfolioRows.length} images inserted`)

// 2. Testimonials
console.log("Seeding testimonials...")
await supabase.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000")
const testimonialRows = TESTIMONIALS.map((t, i) => ({
  customer_name: t.name, review: t.text, rating: 5, is_visible: true,
}))
const { error: testimonialsErr } = await supabase.from("testimonials").insert(testimonialRows)
if (testimonialsErr) console.error("  ERROR:", testimonialsErr.message)
else console.log(`  ✓ ${testimonialRows.length} testimonials inserted`)

// 3. Contact info
console.log("Seeding contact info...")
const { error: contactErr } = await supabase.from("contact_info").update({
  phone:           "(201) 222-2102",
  email:           "info@shearmadnesshoboken.com",
  address_line_1:  "80 Park Ave",
  city_state_zip:  "Hoboken, NJ 07030",
  google_maps_url: "https://maps.google.com/?q=80+Park+Ave+Hoboken+NJ+07030",
}).neq("id", "00000000-0000-0000-0000-000000000000")
if (contactErr) console.error("  ERROR:", contactErr.message)
else console.log("  ✓ Contact info updated")

// 4. Opening hours (from Footer hardcoded defaults)
console.log("Seeding opening hours...")
const hoursUpdates = [
  { day: "monday",    is_closed: true,  open_time: null,       close_time: null },
  { day: "tuesday",   is_closed: false, open_time: "10:00 AM", close_time: "9:00 PM" },
  { day: "wednesday", is_closed: false, open_time: "10:00 AM", close_time: "9:00 PM" },
  { day: "thursday",  is_closed: false, open_time: "10:00 AM", close_time: "9:00 PM" },
  { day: "friday",    is_closed: false, open_time: "10:00 AM", close_time: "8:00 PM" },
  { day: "saturday",  is_closed: false, open_time: "10:00 AM", close_time: "6:00 PM" },
  { day: "sunday",    is_closed: true,  open_time: null,       close_time: null },
]
for (const h of hoursUpdates) {
  const { error } = await supabase.from("opening_hours")
    .update({ is_closed: h.is_closed, open_time: h.open_time, close_time: h.close_time })
    .eq("day", h.day)
  if (error) console.error(`  ${h.day}: ERROR —`, error.message)
  else console.log(`  ${h.day}: ✓`)
}

// 5. Social media
console.log("Seeding social media...")
const socials = [
  { platform: "instagram", url: "https://www.instagram.com/shearmadnesshoboken/", is_enabled: true },
  { platform: "facebook",  url: "https://www.facebook.com/ShearMadnessHobokenNJ/", is_enabled: true },
  { platform: "tiktok",    url: "", is_enabled: false },
]
for (const s of socials) {
  const { error } = await supabase.from("social_media")
    .update({ url: s.url, is_enabled: s.is_enabled })
    .eq("platform", s.platform)
  if (error) console.error(`  ${s.platform}: ERROR —`, error.message)
  else console.log(`  ${s.platform}: ✓`)
}

console.log("\nDone. Check your Supabase table editor to verify.")
