import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const PUBLIC_PATHS = ["/", "/services", "/gallery", "/contact", "/booking", "/join-us", "/credits"] as const

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let target: string[] = [...PUBLIC_PATHS]
  try {
    const body = await req.json().catch(() => null) as { paths?: string[] } | null
    if (body?.paths?.length) {
      target = body.paths.filter((p) => typeof p === "string" && p.startsWith("/"))
    }
  } catch {
    // ignore body parse errors, fall back to default paths
  }

  for (const path of target) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: target })
}
