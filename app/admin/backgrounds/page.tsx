"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Save, ImageIcon } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { type Tables, type Inserts } from "@/lib/types/database"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { PageHeader } from "@/components/admin/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type Background = Tables<"backgrounds">

type SectionDraft = {
  url: string | null
  path: string | null
  dirty: boolean
}

// ─── Config ──────────────────────────────────────────────────────────────────

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

// ─── Card ─────────────────────────────────────────────────────────────────────

function BackgroundCard({
  section,
  background,
  draft,
  onUploadComplete,
  onRemove,
  onSave,
  isSaving,
}: {
  section: SectionKey
  background: Background | undefined
  draft: SectionDraft
  onUploadComplete: (section: SectionKey, url: string, path: string) => void
  onRemove: (section: SectionKey) => void
  onSave: (section: SectionKey) => void
  isSaving: boolean
}) {
  const currentUrl = draft.dirty ? draft.url : (background?.image_url ?? null)
  const isDirty = draft.dirty

  return (
    <div
      className={cn(
        "rounded-2xl border bg-zinc-900 overflow-hidden flex flex-col transition-all duration-200",
        isDirty
          ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
          : "border-zinc-800"
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
            <ImageIcon className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{formatSectionName(section)}</p>
            {background?.updated_at && !isDirty && (
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Updated {new Date(background.updated_at).toLocaleDateString()}
              </p>
            )}
            {isDirty && (
              <p className="text-[11px] text-amber-400 mt-0.5 font-medium">Unsaved changes</p>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          onClick={() => onSave(section)}
          disabled={isSaving || !isDirty}
          className={cn(
            "gap-1.5 text-xs",
            isDirty
              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 border-transparent"
              : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSaving ? "Saving…" : isDirty ? "Save" : "Saved"}
        </Button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1">
        <ImageUploader
          bucket="backgrounds"
          folder={section}
          currentUrl={currentUrl}
          onUploadComplete={(url, path) => onUploadComplete(section, url, path)}
          onRemove={() => onRemove(section)}
          aspectHint="16:9 recommended"
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BackgroundsPage() {
  const queryClient = useQueryClient()

  // Per-section draft state: tracks pending changes before save
  const [drafts, setDrafts] = useState<Partial<Record<SectionKey, SectionDraft>>>({})
  // Per-section saving flag
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null)

  const { data: backgrounds, isLoading } = useQuery<Background[]>({
    queryKey: ["backgrounds"],
    queryFn: fetchBackgrounds,
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      section,
      url,
      path,
    }: {
      section: SectionKey
      url: string | null
      path: string | null
    }) => {
      const supabase = createSupabaseClient()
      const payload: Inserts<"backgrounds"> = {
        section,
        image_url: url,
        image_path: path,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from("backgrounds")
        .upsert(payload, { onConflict: "section" })
      if (error) throw error
    },
    onSuccess: (_, { section }) => {
      toast.success(`${formatSectionName(section)} background saved`)
      queryClient.invalidateQueries({ queryKey: ["backgrounds"] })
      // Clear draft for this section
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

  function handleUploadComplete(section: SectionKey, url: string, path: string) {
    setDrafts((prev) => ({
      ...prev,
      [section]: { url, path, dirty: true },
    }))
  }

  function handleRemove(section: SectionKey) {
    setDrafts((prev) => ({
      ...prev,
      [section]: { url: null, path: null, dirty: true },
    }))
  }

  function handleSave(section: SectionKey) {
    const draft = drafts[section]
    if (!draft?.dirty) return
    setSavingSection(section)
    saveMutation.mutate({ section, url: draft.url, path: draft.path })
  }

  // Build lookup map from fetched data
  const backgroundMap = new Map<string, Background>(
    (backgrounds ?? []).map((bg) => [bg.section, bg])
  )

  const dirtyCount = Object.values(drafts).filter((d) => d?.dirty).length

  return (
    <div>
      <PageHeader
        title="Background Images"
        description="Manage the background images for each section of your website."
        action={
          dirtyCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {dirtyCount} unsaved {dirtyCount === 1 ? "change" : "changes"}
            </span>
          ) : null
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map((section) => (
            <div key={section} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <div className="p-5">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map((section) => {
            const draft = drafts[section] ?? { url: null, path: null, dirty: false }
            return (
              <BackgroundCard
                key={section}
                section={section}
                background={backgroundMap.get(section)}
                draft={draft}
                onUploadComplete={handleUploadComplete}
                onRemove={handleRemove}
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
