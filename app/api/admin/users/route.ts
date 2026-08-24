import { NextResponse } from "next/server"
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server"
import { AdminUserSchema } from "@/lib/validations/schemas"
import { toLoginEmail } from "@/lib/auth/login-email"

export const dynamic = "force-dynamic"

// Creating and listing auth users needs the service role key, so every request
// is gated on an existing admin session first.
async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const service = createSupabaseServiceClient()
  const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const users = data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      is_self: u.id === admin.id,
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = AdminUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid username or password" },
      { status: 400 }
    )
  }

  const email = toLoginEmail(parsed.data.username)
  const service = createSupabaseServiceClient()

  const { data, error } = await service.auth.admin.createUser({
    email,
    password: parsed.data.password,
    // No mail is sent to these addresses, so confirm the account outright —
    // otherwise the new user cannot sign in.
    email_confirm: true,
  })

  if (error) {
    const alreadyExists =
      error.status === 422 || /already (been )?registered|already exists/i.test(error.message)
    return NextResponse.json(
      { error: alreadyExists ? "That username is already taken." : error.message },
      { status: alreadyExists ? 409 : 500 }
    )
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email ?? email },
  })
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as { id?: string } | null
  const id = body?.id
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 })
  }
  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 })
  }

  const service = createSupabaseServiceClient()
  const { data: existing, error: listError } = await service.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }
  // Never leave the salon locked out of its own admin panel.
  if (existing.users.length <= 1) {
    return NextResponse.json(
      { error: "This is the last account — create another one before removing it." },
      { status: 400 }
    )
  }

  const { error } = await service.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: id })
}
