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
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    href: "/admin/portfolio",
    label: "Portfolio",
    description: "Manage gallery photos",
    icon: Grid3X3,
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    href: "/admin/services",
    label: "Services",
    description: "Edit service menu & prices",
    icon: Scissors,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    href: "/admin/team",
    label: "Team Members",
    description: "Manage your staff profiles",
    icon: Users,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    description: "Manage customer reviews",
    icon: Star,
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  {
    href: "/admin/before-after",
    label: "Before & After",
    description: "Showcase transformation photos",
    icon: ArrowLeftRight,
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    href: "/admin/faq",
    label: "FAQ",
    description: "Edit frequently asked questions",
    icon: HelpCircle,
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    href: "/admin/hours",
    label: "Opening Hours",
    description: "Set your weekly schedule",
    icon: Clock,
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    href: "/admin/holidays",
    label: "Holiday Hours",
    description: "Set special holiday closures",
    icon: CalendarX2,
    color: "from-red-500/20 to-red-500/5 border-red-500/20",
    iconColor: "text-red-400",
  },
  {
    href: "/admin/contact",
    label: "Contact Info",
    description: "Update phone, email & address",
    icon: Phone,
    color: "from-teal-500/20 to-teal-500/5 border-teal-500/20",
    iconColor: "text-teal-400",
  },
  {
    href: "/admin/social",
    label: "Social Media",
    description: "Manage Instagram, Facebook & TikTok",
    icon: Share2,
    color: "from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
  },
]

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Good day! 👋</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Welcome to your website manager. Everything you need is right here.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Services", value: stats.services, icon: Scissors },
          { label: "Gallery Photos", value: stats.portfolio, icon: Grid3X3 },
          { label: "Team Members", value: stats.team, icon: Users },
          { label: "Testimonials", value: stats.testimonials, icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {label}
              </span>
              <Icon className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {stats.lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <TrendingUp className="h-3.5 w-3.5" />
          Website last updated {formatDate(stats.lastUpdated)}
        </div>
      )}

      {/* Section cards */}
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
        Manage Your Website
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(({ href, label, description, icon: Icon, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={`group relative bg-gradient-to-br ${color} border rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 hover:shadow-lg hover:shadow-black/30`}
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 mb-3 ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-0.5">{label}</h3>
            <p className="text-xs text-zinc-400">{description}</p>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
              →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
