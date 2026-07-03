"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save, Camera, Globe, Music2, ExternalLink } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type SocialMedia = {
  id: string
  platform: "instagram" | "facebook" | "tiktok"
  url: string
  is_enabled: boolean
}

type SocialDraft = {
  id: string
  platform: "instagram" | "facebook" | "tiktok"
  url: string
  is_enabled: boolean
}

const PLATFORMS: {
  key: "instagram" | "facebook" | "tiktok"
  label: string
  icon: React.ElementType
  placeholder: string
  color: string
  iconColor: string
  bgColor: string
  borderColor: string
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: Camera,
    placeholder: "https://instagram.com/yoursalon",
    color: "from-pink-500/10 to-purple-500/10",
    iconColor: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Globe,
    placeholder: "https://facebook.com/yoursalon",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: Music2,
    placeholder: "https://tiktok.com/@yoursalon",
    color: "from-zinc-700/30 to-zinc-800/30",
    iconColor: "text-zinc-300",
    bgColor: "bg-zinc-700/20",
    borderColor: "border-zinc-600/30",
  },
]

const DEFAULT_DRAFTS: SocialDraft[] = PLATFORMS.map((p) => ({
  id: "",
  platform: p.key,
  url: "",
  is_enabled: false,
}))

export default function SocialPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const [drafts, setDrafts] = useState<SocialDraft[]>(DEFAULT_DRAFTS)

  const { data: socialRows = [], isLoading } = useQuery<SocialMedia[]>({
    queryKey: ["social"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media")
        .select("*")
        .in("platform", ["instagram", "facebook", "tiktok"])
      if (error) throw error
      return (data ?? []) as SocialMedia[]
    },
  })

  // Sync drafts when data loads
  useEffect(() => {
    if (socialRows.length > 0) {
      setDrafts(
        PLATFORMS.map((p) => {
          const row = socialRows.find((r) => r.platform === p.key)
          return {
            id: row?.id ?? "",
            platform: p.key,
            url: row?.url ?? "",
            is_enabled: row?.is_enabled ?? false,
          }
        })
      )
    }
  }, [socialRows])

  const saveMutation = useMutation({
    mutationFn: async (rows: SocialDraft[]) => {
      const upsertPayload = rows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        platform: r.platform,
        url: r.url,
        is_enabled: r.is_enabled,
      }))
      const { error } = await supabase
        .from("social_media")
        .upsert(upsertPayload, { onConflict: "platform" })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social"] })
      toast.success("Social media links saved")
    },
    onError: () => toast.error("Failed to save social media links"),
  })

  function updateDraft(
    platform: SocialDraft["platform"],
    patch: Partial<SocialDraft>
  ) {
    setDrafts((prev) =>
      prev.map((d) => (d.platform === platform ? { ...d, ...patch } : d))
    )
  }

  function handleSave() {
    saveMutation.mutate(drafts)
  }

  return (
    <div>
      <PageHeader
        title="Social Media"
        description="Manage your social media links and visibility."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {PLATFORMS.map((platform) => {
            const draft = drafts.find((d) => d.platform === platform.key)
            if (!draft) return null
            const Icon = platform.icon

            return (
              <div
                key={platform.key}
                className={cn(
                  "rounded-xl border bg-gradient-to-br p-5",
                  platform.color,
                  platform.borderColor,
                  "border"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Platform icon */}
                  <div
                    className={cn(
                      "shrink-0 h-11 w-11 rounded-xl flex items-center justify-center border",
                      platform.bgColor,
                      platform.borderColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", platform.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {platform.label}
                        </span>
                        {draft.is_enabled ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Label
                          htmlFor={`social-enabled-${platform.key}`}
                          className="text-xs text-zinc-400 cursor-pointer"
                        >
                          {draft.is_enabled ? "Enabled" : "Disabled"}
                        </Label>
                        <Switch
                          id={`social-enabled-${platform.key}`}
                          checked={draft.is_enabled}
                          onCheckedChange={(checked) =>
                            updateDraft(platform.key, { is_enabled: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`social-url-${platform.key}`}
                        className="text-xs text-zinc-400"
                      >
                        Profile URL
                      </Label>
                      <div className="relative">
                        <Input
                          id={`social-url-${platform.key}`}
                          type="url"
                          value={draft.url}
                          onChange={(e) =>
                            updateDraft(platform.key, { url: e.target.value })
                          }
                          placeholder={platform.placeholder}
                          className="pr-9"
                        />
                        {draft.url && (
                          <a
                            href={draft.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="lg"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving…" : "Save All"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
