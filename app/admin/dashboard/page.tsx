import { createSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"
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
  TrendingUp,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getStats() {
  const supabase = await createSupabaseServerClient()

  const [services, portfolio, team, testimonials, faq, backgrounds] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_images").select("id", { count: "exact", head: true }),
    supabase.from("team_members").select("id", { count: "exact", head: true }),
    supabase.from("testimonials").select("id", { count: "exact", head: true }),
    supabase.from("faq").select("id", { count: "exact", head: true }),
    supabase.from("backgrounds").select("updated_at").order("updated_at", { ascending: false }).limit(1),
  ])

  return {
    services: services.count ?? 0,
    portfolio: portfolio.count ?? 0,
    team: team.count ?? 0,
    testimonials: testimonials.count ?? 0,
    faq: faq.count ?? 0,
    lastUpdated: (backgrounds.data as Array<{ updated_at: string }> | null)?.[0]?.updated_at ?? null,
  }
}

const sections = [
  {
    href: "/admin/backgrounds",
    label: "Backgrounds",
    description: "Update website background images",
    icon: Image,
    bg: "bg-violet-600",
    iconBg: "bg-violet-500",
  },
  {
    href: "/admin/services",
    label: "Services",
    description: "Edit service menu & prices",
    icon: Scissors,
    bg: "bg-amber-500",
    iconBg: "bg-amber-400",
  },
  {
    href: "/admin/team",
    label: "Team Members",
    description: "Manage your staff profiles",
    icon: Users,
    bg: "bg-emerald-600",
    iconBg: "bg-emerald-500",
  },
  {
    href: "/admin/portfolio",
    label: "Portfolio",
    description: "Manage gallery photos",
    icon: Grid3X3,
    bg: "bg-blue-600",
    iconBg: "bg-blue-500",
  },
  {
    href: "/admin/before-after",
    label: "Before & After",
    description: "Showcase transformation photos",
    icon: ArrowLeftRight,
    bg: "bg-pink-600",
    iconBg: "bg-pink-500",
  },
  {
    href: "/admin/contact",
    label: "Contact Info",
    description: "Update phone, email & address",
    icon: Phone,
    bg: "bg-teal-600",
    iconBg: "bg-teal-500",
  },
  {
    href: "/admin/hours",
    label: "Opening Hours",
    description: "Set your weekly schedule",
    icon: Clock,
    bg: "bg-orange-500",
    iconBg: "bg-orange-400",
  },
  {
    href: "/admin/holidays",
    label: "Holiday Hours",
    description: "Set special holiday closures",
    icon: CalendarX2,
    bg: "bg-red-600",
    iconBg: "bg-red-500",
  },
  {
    href: "/admin/social",
    label: "Social Media",
    description: "Manage Instagram, Facebook & TikTok",
    icon: Share2,
    bg: "bg-fuchsia-600",
    iconBg: "bg-fuchsia-500",
  },
  {
    href: "/admin/faq",
    label: "FAQ",
    description: "Edit frequently asked questions",
    icon: HelpCircle,
    bg: "bg-cyan-600",
    iconBg: "bg-cyan-500",
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    description: "Manage customer reviews",
    icon: Star,
    bg: "bg-yellow-500",
    iconBg: "bg-yellow-400",
  },
]

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div>
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Good day! 👋</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Welcome to your website manager. Everything you need is right here.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Services", value: stats.services, icon: Scissors },
          { label: "Gallery Photos", value: stats.portfolio, icon: Grid3X3 },
          { label: "Team Members", value: stats.team, icon: Users },
          { label: "Testimonials", value: stats.testimonials, icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {label}
              </span>
              <Icon className="h-5 w-5 text-gray-300" />
            </div>
            <div className="text-4xl font-bold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      {stats.lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <TrendingUp className="h-4 w-4" />
          Website last updated {formatDate(stats.lastUpdated)}
        </div>
      )}

      {/* Section cards */}
      <h2 className="text-base font-bold text-gray-400 uppercase tracking-wider mb-5">
        Manage Your Website
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ href, label, description, icon: Icon, bg, iconBg }) => (
          <Link
            key={href}
            href={href}
            className={`group relative ${bg} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 hover:shadow-xl`}
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} mb-4 text-white/90`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">{label}</h3>
            <p className="text-sm text-white/70">{description}</p>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/80 transition-colors text-lg">
              →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
