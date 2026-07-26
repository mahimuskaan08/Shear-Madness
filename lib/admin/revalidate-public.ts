// Bust the ISR cache for public pages so admin edits show up immediately
// instead of waiting for the page's revalidate window.
export async function revalidatePublic(paths?: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: paths ? JSON.stringify({ paths }) : undefined,
    })
  } catch {
    // ISR fallback (revalidate=10) will still catch up
  }
}
