"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Image,
  Grid3X3,
  Scissors,
  Users,
  Star,
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-20 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-none">Shear Madness</p>
            <p className="text-sm text-gray-500 leading-none mt-1">Admin Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-600 border border-amber-200 shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-amber-500" : "text-gray-400")} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-4 w-4 text-amber-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
