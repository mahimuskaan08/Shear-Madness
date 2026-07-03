import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/AdminShell"
import { QueryProvider } from "@/components/admin/QueryProvider"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin — Shear Madness",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No auth → middleware redirects non-login routes to /admin/login
  // The only page that reaches here without auth is /admin/login itself
  if (!user) {
    return <>{children}</>
  }

  return (
    <QueryProvider>
      <AdminShell>{children}</AdminShell>
    </QueryProvider>
  )
}
