"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Save, ImageIcon, Monitor, Tablet, Smartphone, RotateCcw } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { type Tables, type Inserts } from "@/lib/types/database"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { PageHeader } from "@/components/admin/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Background = Tables<"backgrounds">

type DeviceKey = "desktop" | "tablet" | "mobile"

type DeviceDraft = {
  url: string | null
  path: string | null
  dirty: boolean
}

type SectionDraft = {
  desktop: DeviceDraft
  tablet: DeviceDraft
  mobile: DeviceDraft
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  "hero",
  "about",
  "artist",
  "booking",
  "gallery",
  "contact",
  "services",
  "join",
  "credits",
] as const

type SectionKey = (typeof SECTIONS)[number]

const DEVICES: {
  key: DeviceKey
  label: string
  icon: React.ElementType
  hint: string
}[] = [
  { key: "desktop", label: "Laptop / Desktop", icon: Monitor, hint: "16:9 recommended" },
  { key: "tablet", label: "iPad / Tablet", icon: Tablet, hint: "4:3 recommended" },
  { key: "mobile", label: "Mobile", icon: Smartphone, hint: "9:16 recommended" },
]

function formatSectionName(section: string): string {
  const overrides: Record<string, string> = {
    hero: "Hero Section",
    about: "About Section",
    artist: "Our Artist",
    booking: "Booking Section",
    gallery: "Gallery Section",
    contact: "Contact Section",
    services: "Services Section",
    join: "Join the Team",
    credits: "Credits",
  }
  return overrides[section] ?? section.charAt(0).toUpperCase() + section.slice(1)
}

// Default static images per section/device (the fallbacks baked into each component)
const DEFAULTS: Record<SectionKey, Record<DeviceKey, string | null>> = {
  hero:     { desktop: "/hero-bg.png",           tablet: null,                    mobile: "/hero-bg-mobile.png"     },
  about:    { desktop: "/about-bg.png",          tablet: "/about-bg-tablet.png",  mobile: "/about-bg-mobile.png"    },
  artist:   { desktop: "/artist-bg.png",         tablet: null,                    mobile: null                      },
  services: { desktop: "/services-koi-bg.png",   tablet: null,                    mobile: null                      },
  contact:  { desktop: "/contact-koi-bg.png",    tablet: null,                    mobile: "/contact-koi-bg-mobile.png" },
  booking:  { desktop: "/booking-bg.jpg",        tablet: null,                    mobile: "/booking-bg-mobile.png"  },
  join:     { desktop: "/join-bg.jpg",           tablet: "/join-bg-tablet.png",   mobile: "/join-bg-mobile.png"     },
  gallery:  { desktop: null,                     tablet: null,                    mobile: null                      },
  credits:  { desktop: null,                     tablet: null,                    mobile: null                      },
}

// DB row key: "hero_desktop", "hero_tablet", "hero_mobile", etc.
function dbKey(section: SectionKey, device: DeviceKey): string {
  return `${section}_${device}`
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchBackgrounds(): Promise<Background[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("backgrounds")
    .select("*")
    .order("section")
  if (error) throw error
  return data ?? []
}

// ─── Device Uploader ──────────────────────────────────────────────────────────

function DeviceUploader({
  section,
  device,
  currentUrl,
  draft,
  onUploadComplete,
  onRemove,
  onRestoreDefault,
}: {
  section: SectionKey
  device: (typeof DEVICES)[number]
  currentUrl: string | null
  draft: DeviceDraft
  onUploadComplete: (section: SectionKey, device: DeviceKey, url: string, path: string) => void
  onRemove: (section: SectionKey, device: DeviceKey) => void
  onRestoreDefault: (section: SectionKey, device: DeviceKey) => void
}) {
  const displayUrl = draft.dirty ? draft.url : currentUrl
  const defaultUrl = DEFAULTS[section][device.key]
  const isAtDefault = displayUrl === defaultUrl || (!displayUrl && !defaultUrl)
  const canRestore = !!defaultUrl && !isAtDefault
  const Icon = device.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-1">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-600">{device.label}</span>
        {draft.dirty && (
          <span className="text-xs text-amber-500 font-medium ml-auto">Unsaved</span>
        )}
      </div>
      {canRestore && (
        <button
          type="button"
          onClick={() => onRestoreDefault(section, device.key)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors py-1"
        >
          <RotateCcw className="h-3 w-3" />
          Restore to default
        </button>
      )}
      <ImageUploader
        bucket="backgrounds"
        folder={`${section}/${device.key}`}
        currentUrl={displayUrl}
        onUploadComplete={(url, path) => onUploadComplete(section, device.key, url, path)}
        onRemove={() => onRemove(section, device.key)}
        aspectHint={device.hint}
      />
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function BackgroundCard({
  section,
  backgroundMap,
  sectionDraft,
  onUploadComplete,
  onRemove,
  onRestoreDefault,
  onSave,
  isSaving,
}: {
  section: SectionKey
  backgroundMap: Map<string, Background>
  sectionDraft: SectionDraft
  onUploadComplete: (section: SectionKey, device: DeviceKey, url: string, path: string) => void
  onRemove: (section: SectionKey, device: DeviceKey) => void
  onRestoreDefault: (section: SectionKey, device: DeviceKey) => void
  onSave: (section: SectionKey) => void
  isSaving: boolean
}) {
  const isDirty = DEVICES.some((d) => sectionDraft[d.key].dirty)

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white overflow-hidden transition-all duration-200 shadow-sm",
        isDirty
          ? "border-amber-300 shadow-amber-100 shadow-md"
          : "border-gray-200"
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
            <ImageIcon className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{formatSectionName(section)}</p>
            {isDirty ? (
              <p className="text-xs text-amber-500 mt-0.5 font-medium">Unsaved changes</p>
            ) : (
              (() => {
                const lastUpdated = DEVICES.map((d) => backgroundMap.get(dbKey(section, d.key))?.updated_at)
                  .filter(Boolean)
                  .sort()
                  .at(-1)
                return lastUpdated ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Updated {new Date(lastUpdated).toLocaleDateString()}
                  </p>
                ) : null
              })()
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          onClick={() => onSave(section)}
          disabled={isSaving || !isDirty}
          className={cn(
            "gap-1.5 text-sm px-4 py-2",
            isDirty
              ? "bg-amber-500 hover:bg-amber-400 text-white border-transparent"
              : "border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving…" : isDirty ? "Save" : "Saved"}
        </Button>
      </div>

      {/* Three uploaders: Desktop / Tablet / Mobile */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEVICES.map((device) => (
          <DeviceUploader
            key={device.key}
            section={section}
            device={device}
            currentUrl={backgroundMap.get(dbKey(section, device.key))?.image_url ?? null}
            draft={sectionDraft[device.key]}
            onUploadComplete={onUploadComplete}
            onRemove={onRemove}
            onRestoreDefault={onRestoreDefault}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BackgroundsPage() {
  const queryClient = useQueryClient()

  const emptyDeviceDraft = (): DeviceDraft => ({ url: null, path: null, dirty: false })
  const emptySection = (): SectionDraft => ({
    desktop: emptyDeviceDraft(),
    tablet: emptyDeviceDraft(),
    mobile: emptyDeviceDraft(),
  })

  const [drafts, setDrafts] = useState<Partial<Record<SectionKey, SectionDraft>>>({})
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null)

  const { data: backgrounds, isLoading } = useQuery<Background[]>({
    queryKey: ["backgrounds"],
    queryFn: fetchBackgrounds,
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      section,
      sectionDraft,
    }: {
      section: SectionKey
      sectionDraft: SectionDraft
    }) => {
      const supabase = createSupabaseClient()
      const dirtyDevices = DEVICES.filter((d) => sectionDraft[d.key].dirty)
      const payloads: Inserts<"backgrounds">[] = dirtyDevices.map((d) => ({
        section: dbKey(section, d.key),
        image_url: sectionDraft[d.key].url,
        image_path: sectionDraft[d.key].path,
        updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase
        .from("backgrounds")
        .upsert(payloads, { onConflict: "section" })
      if (error) throw error
    },
    onSuccess: (_, { section }) => {
      toast.success(`${formatSectionName(section)} backgrounds saved`)
      queryClient.invalidateQueries({ queryKey: ["backgrounds"] })
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[section]
        return next
      })
    },
    onError: (err: Error, { section }) => {
      toast.error(`Failed to save ${formatSectionName(section)}: ${err.message}`)
    },
    onSettled: () => {
      setSavingSection(null)
    },
  })

  function handleUploadComplete(section: SectionKey, device: DeviceKey, url: string, path: string) {
    setDrafts((prev) => {
      const existing = prev[section] ?? emptySection()
      return {
        ...prev,
        [section]: {
          ...existing,
          [device]: { url, path, dirty: true },
        },
      }
    })
  }

  function handleRemove(section: SectionKey, device: DeviceKey) {
    setDrafts((prev) => {
      const existing = prev[section] ?? emptySection()
      return {
        ...prev,
        [section]: {
          ...existing,
          [device]: { url: null, path: null, dirty: true },
        },
      }
    })
  }

  function handleRestoreDefault(section: SectionKey, device: DeviceKey) {
    const defaultUrl = DEFAULTS[section][device]
    if (!defaultUrl) return
    setDrafts((prev) => {
      const existing = prev[section] ?? emptySection()
      return {
        ...prev,
        [section]: {
          ...existing,
          [device]: { url: defaultUrl, path: null, dirty: true },
        },
      }
    })
  }

  function handleSave(section: SectionKey) {
    const sectionDraft = drafts[section]
    if (!sectionDraft) return
    const anyDirty = DEVICES.some((d) => sectionDraft[d.key].dirty)
    if (!anyDirty) return
    setSavingSection(section)
    saveMutation.mutate({ section, sectionDraft })
  }

  const backgroundMap = new Map<string, Background>(
    (backgrounds ?? []).map((bg) => [bg.section, bg])
  )

  const totalDirtyDevices = Object.values(drafts).reduce((sum, sd) => {
    if (!sd) return sum
    return sum + DEVICES.filter((d) => sd[d.key].dirty).length
  }, 0)

  return (
    <div>
      <PageHeader
        title="Background Images"
        description="Manage background images per section. Upload separate images for Laptop, iPad, and Mobile."
        action={
          totalDirtyDevices > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {totalDirtyDevices} unsaved {totalDirtyDevices === 1 ? "change" : "changes"}
            </span>
          ) : null
        }
      />

      {/* Device legend */}
      <div className="flex items-center gap-6 mb-8 flex-wrap">
        {DEVICES.map((d) => {
          const Icon = d.icon
          return (
            <div key={d.key} className="flex items-center gap-2 text-sm text-gray-500">
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">{d.label}</span>
              <span className="text-gray-300">·</span>
              <span>{d.hint}</span>
            </div>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {DEVICES.map((d) => (
                  <Skeleton key={d.key} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const sectionDraft = drafts[section] ?? emptySection()
            return (
              <BackgroundCard
                key={section}
                section={section}
                backgroundMap={backgroundMap}
                sectionDraft={sectionDraft}
                onUploadComplete={handleUploadComplete}
                onRemove={handleRemove}
                onRestoreDefault={handleRestoreDefault}
                onSave={handleSave}
                isSaving={savingSection === section && saveMutation.isPending}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
