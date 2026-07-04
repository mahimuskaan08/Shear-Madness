import fs from "fs"
import path from "path"
import type { SitePortfolioImage } from "@/lib/site-data"

function categoryFromPrefix(prefix: string): "men" | "women" | "both" {
  if (prefix === "m")  return "men"
  if (prefix === "w")  return "women"
  return "both" // hm, hw, or anything else → Hair & Makeup
}

export function getLocalGalleryImages(): SitePortfolioImage[] {
  try {
    const dir = path.join(process.cwd(), "public", "gallery")
    const files = fs.readdirSync(dir)

    // Build a map: baseName → { preview?: filename, full?: filename }
    const groups: Record<string, { preview?: string; full?: string }> = {}
    for (const file of files) {
      const match = file.match(/^(.+)-(preview|full)\.[^.]+$/)
      if (!match) continue
      const [, base, type] = match
      if (!groups[base]) groups[base] = {}
      groups[base][type as "preview" | "full"] = file
    }

    // Sort: men (m*) first, then women (w*), then makeup (hm*)
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      const prefixA = a.replace(/[0-9]+$/, "")
      const prefixB = b.replace(/[0-9]+$/, "")
      const order = (p: string) => p === "m" ? 0 : p === "w" ? 1 : 2
      if (order(prefixA) !== order(prefixB)) return order(prefixA) - order(prefixB)
      // Numeric sort within the same prefix
      const numA = parseInt(a.replace(/\D/g, ""), 10)
      const numB = parseInt(b.replace(/\D/g, ""), 10)
      return numA - numB
    })

    return sorted
      .filter(([, g]) => g.preview) // must have at least a preview
      .map(([base, g], i) => {
        const prefix = base.replace(/[0-9]+$/, "")
        return {
          id:            `local-${base}`,
          url:           `/gallery/${g.preview}`,
          full_url:      g.full ? `/gallery/${g.full}` : undefined,
          alt:           "",
          title:         "",
          category:      categoryFromPrefix(prefix),
          featured:      false,
          display_order: i + 1,
        }
      })
  } catch {
    return []
  }
}
