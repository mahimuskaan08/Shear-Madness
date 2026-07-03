"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Image,
  Grid3X3,
  Scissors,
  Users,
  Star,
  ArrowLeftRight,
  HelpCircle,
  Clock,
  CalendarX2,
  Phone,
  Share2,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/backgrounds", label: "Backgrounds", icon: Image },
  { href: "/admin/portfolio", label: "Portfolio", icon: Grid3X3 },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/team", label: "Team Members", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/before-after", label: "Before & After", icon: ArrowLeftRight },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/hours", label: "Opening Hours", icon: Clock },
  { href: "/admin/holidays", label: "Holiday Hours", icon: CalendarX2 },
  { href: "/admin/contact", label: "Contact Info", icon: Phone },
  { href: "/admin/social", label: "Social Media", icon: Share2 },
]

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/admin/login")
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Scissors className="h-4 w-4 text-zinc-950" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Shear Madness</p>
            <p className="text-xs text-zinc-500 leading-none mt-0.5">Admin Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-amber-400")} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-amber-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
