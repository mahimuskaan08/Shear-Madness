"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Loader2, ShieldCheck, Eye, EyeOff, UserPlus } from "lucide-react"
import { AdminUserSchema, type AdminUserFormData } from "@/lib/validations/schemas"
import { LOGIN_EMAIL_DOMAIN, toDisplayUsername } from "@/lib/auth/login-email"
import { PageHeader } from "@/components/admin/PageHeader"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

type AdminUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_self: boolean
}

async function readError(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? fallback
}

function AddUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(AdminUserSchema),
    defaultValues: { username: "", password: "" },
  })

  const username = watch("username")

  const handleOpen = (o: boolean) => {
    setOpen(o)
    if (o) reset({ username: "", password: "" })
  }

  const onSubmit = async (data: AdminUserFormData) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        toast.error(await readError(res, "Could not create that user"))
        return
      }
      toast.success("User created — they can sign in right away")
      setOpen(false)
      onSuccess()
    } catch {
      toast.error("Could not reach the server. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Pick any username and password. The new user can sign in immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="new-username">Username</Label>
            <Input
              id="new-username"
              placeholder="sarah"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              {...register("username")}
            />
            {errors.username ? (
              <p className="text-xs text-red-400">{errors.username.message}</p>
            ) : (
              <p className="text-xs text-zinc-400">
                {username && !username.includes("@")
                  ? `Signs in as "${username}" (full address ${username.toLowerCase()}@${LOGIN_EMAIL_DOMAIN})`
                  : "A plain username is fine. A full email address works too."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error(await readError(res, "Could not load users"))
      const body = (await res.json()) as { users: AdminUser[] }
      return body.users
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (user: AdminUser) => {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      })
      if (!res.ok) throw new Error(await readError(res, "Could not remove that user"))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User removed")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] })

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone who can sign in to this admin panel"
        action={<AddUserDialog onSuccess={invalidate} />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">
          {(error as Error).message}
        </div>
      ) : !users?.length ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <UserPlus className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No users yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="h-11 w-11 shrink-0 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 truncate">
                    {toDisplayUsername(u.email)}
                  </span>
                  {u.is_self && <Badge variant="secondary">You</Badge>}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{u.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Added {formatDate(u.created_at)}
                  {u.last_sign_in_at
                    ? ` · Last signed in ${formatDate(u.last_sign_in_at)}`
                    : " · Never signed in"}
                </p>
              </div>

              {!u.is_self && (
                <ConfirmDelete
                  onConfirm={() => deleteMutation.mutate(u)}
                  itemName={toDisplayUsername(u.email)}
                  disabled={deleteMutation.isPending}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
