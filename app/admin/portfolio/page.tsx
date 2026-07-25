"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import {
  Plus,
  ImageIcon,
  Star,
  Loader2,
  Grid3X3,
  X,
  Images,
  Pencil,
} from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { type Tables, type Inserts, type Updates, type Json } from "@/lib/types/database"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SortableItem } from "@/components/admin/SortableItem"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "women" | "men" | "both"

type PortfolioImage = Tables<"portfolio_images">

type AngleDraft = { url: string; path: string }

type UploadDraft = AngleDraft | null

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  women: "Women's",
  men: "Men's",
  both: "Both",
}

const CATEGORY_BADGE_VARIANT: Record<Category, "orange"> = {
  women: "orange",
  men: "orange",
  both: "orange",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAngles(raw: Json): AngleDraft[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is AngleDraft =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as AngleDraft).url === "string"
  )
}

// Supabase / PostgREST errors are not standard Errors. Pull whatever text we can
// so the toast is never just "{}".
function readableError(err: unknown): string {
  if (!err) return "Unknown error"
  if (err instanceof Error) return err.message
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>
    const parts = [o.message, o.details, o.hint, o.code]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
    if (parts.length) return parts.join(" — ")
    try {
      const s = JSON.stringify(err, Object.getOwnPropertyNames(err))
      if (s && s !== "{}") return s
    } catch {}
  }
  return String(err)
}

// Detect PostgREST schema-cache errors for any of the newly added columns.
function isNewColumnSchemaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const msg =
    "message" in err ? String((err as { message: unknown }).message ?? "") : ""
  return /(thumbnail|multiangle)_(url|path)/i.test(msg) ||
    /column .*does not exist/i.test(msg) ||
    /schema cache/i.test(msg)
}

// Bust the ISR cache for the public /gallery page so admin edits show up
// immediately instead of waiting for the 10s revalidate window.
async function revalidatePublic() {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/gallery"] }),
    })
  } catch {
    // ISR fallback (revalidate=10) will still catch up
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPortfolioImages(category: Category): Promise<PortfolioImage[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("portfolio_images")
    .select("*")
    .eq("category", category)
    .order("display_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

function UploadDialog({
  open,
  onOpenChange,
  defaultCategory,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory: Category
  onSuccess: () => void
}) {
  const [thumbnailDraft, setThumbnailDraft] = useState<UploadDraft>(null)
  const [multiAngleDraft, setMultiAngleDraft] = useState<UploadDraft>(null)
  const [category, setCategory] = useState<Category>(defaultCategory)
  const [alt, setAlt] = useState("")
  const [title, setTitle] = useState("")
  const [featured, setFeatured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setThumbnailDraft(null)
    setMultiAngleDraft(null)
    setCategory(defaultCategory)
    setAlt("")
    setTitle("")
    setFeatured(false)
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setCategory(defaultCategory)
    } else {
      resetForm()
    }
    onOpenChange(next)
  }

  async function handleSave() {
    if (!thumbnailDraft) {
      toast.error("Please upload a thumbnail picture.")
      return
    }
    if (!multiAngleDraft) {
      toast.error("Please upload a multi-angle photo.")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createSupabaseClient()

      const { data: existing } = await supabase
        .from("portfolio_images")
        .select("display_order")
        .eq("category", category)
        .order("display_order", { ascending: false })
        .limit(1)

      const nextOrder = (existing?.[0]?.display_order ?? -1) + 1

      // Legacy required columns (url, path are NOT NULL). Always written.
      const legacyPayload = {
        url: multiAngleDraft.url,
        path: multiAngleDraft.path,
        alt: alt.trim() || "Portfolio image",
        title: title.trim() || "",
        category,
        featured,
        display_order: nextOrder,
      }

      const thumbPayload = {
        ...legacyPayload,
        thumbnail_url: thumbnailDraft?.url ?? null,
        thumbnail_path: thumbnailDraft?.path ?? null,
      }
      const fullPayload = {
        ...thumbPayload,
        multiangle_url: multiAngleDraft.url,
        multiangle_path: multiAngleDraft.path,
      }
      console.log("[portfolio] insert attempt:", {
        hasThumbnail: !!thumbnailDraft,
      })

      // Cascade: full → thumb-only (drop multiangle) → legacy only.
      const tryInsert = (payload: Inserts<"portfolio_images">) =>
        supabase.from("portfolio_images").insert(payload)

      const r1 = await tryInsert(fullPayload)
      if (r1.error && isNewColumnSchemaError(r1.error)) {
        console.warn("[portfolio] full failed:", r1.error.message, "→ trying thumb-only")
        const r2 = await tryInsert(thumbPayload)
        if (r2.error && isNewColumnSchemaError(r2.error)) {
          console.warn("[portfolio] thumb-only failed:", r2.error.message, "→ trying legacy only")
          const r3 = await tryInsert(legacyPayload)
          if (r3.error) throw r3.error
          console.warn("[portfolio] legacy-only succeeded — thumbnail NOT persisted")
        } else if (r2.error) {
          throw r2.error
        } else {
          console.log("[portfolio] thumb-only succeeded — thumbnail persisted, multiangle_* NOT")
        }
      } else if (r1.error) {
        throw r1.error
      } else {
        console.log("[portfolio] full succeeded")
      }

      toast.success("Photo added to portfolio")
      await revalidatePublic()
      onSuccess()
      handleOpenChange(false)
    } catch (err) {
      console.error("Portfolio insert error:", err)
      toast.error(`Save failed: ${readableError(err)}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Portfolio Photo</DialogTitle>
          <DialogDescription>
            Upload a thumbnail and a multi-angle photo for the gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Thumbnail Picture ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-amber-400 uppercase tracking-wider block">
              Thumbnail Picture <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-zinc-500">
              A single clean portrait shown as the gallery card preview.
            </p>
            <ImageUploader
              bucket="portfolio"
              folder={`${category}/thumbnails`}
              currentUrl={thumbnailDraft?.url ?? null}
              onUploadComplete={(url, path) => setThumbnailDraft({ url, path })}
              onRemove={() => setThumbnailDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>

          {/* ── Multi-Angle Photo ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-blue-400 uppercase tracking-wider block">
              Multi-Angle Photo <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-zinc-500">
              The collage or multi-shot image shown in the full gallery view.
            </p>
            <ImageUploader
              bucket="portfolio"
              folder={category}
              currentUrl={multiAngleDraft?.url ?? null}
              onUploadComplete={(url, path) => setMultiAngleDraft({ url, path })}
              onRemove={() => setMultiAngleDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>

          {/* ── Category ── */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-category" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Category
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="dialog-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="women">Women&apos;s</SelectItem>
                <SelectItem value="men">Men&apos;s</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Title ── */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-title" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Title <span className="text-zinc-600 normal-case font-normal">(optional)</span>
            </Label>
            <Input
              id="dialog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Balayage highlights"
              className="bg-zinc-800/50 border-zinc-700 focus:border-amber-400/50"
            />
          </div>

          {/* ── Alt text ── */}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-alt" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Alt text <span className="text-zinc-600 normal-case font-normal">(accessibility)</span>
            </Label>
            <Input
              id="dialog-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Woman with balayage highlights"
              className="bg-zinc-800/50 border-zinc-700 focus:border-amber-400/50"
            />
          </div>

          {/* ── Featured toggle ── */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-800/50 border border-zinc-800 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Featured photo</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Featured photos are highlighted in the gallery
              </p>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isSaving || !multiAngleDraft || !thumbnailDraft}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to Portfolio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Dialog ─────────────────────────────────────────────────────────────

function EditDialog({
  image,
  open,
  onOpenChange,
  onSuccess,
}: {
  image: PortfolioImage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [thumbnailDraft, setThumbnailDraft] = useState<UploadDraft>(null)
  const [multiAngleDraft, setMultiAngleDraft] = useState<UploadDraft>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (image && open) {
      setThumbnailDraft(
        image.thumbnail_url && image.thumbnail_path
          ? { url: image.thumbnail_url, path: image.thumbnail_path }
          : null
      )
      setMultiAngleDraft({ url: image.url, path: image.path })
    }
  }, [image, open])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setThumbnailDraft(null)
      setMultiAngleDraft(null)
    }
    onOpenChange(next)
  }

  async function handleSave() {
    if (!image) return
    if (!thumbnailDraft) {
      toast.error("Please upload a thumbnail picture.")
      return
    }
    if (!multiAngleDraft) {
      toast.error("Please upload a multi-angle photo.")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createSupabaseClient()

      // Remove old multi-angle photo from storage if replaced
      if (multiAngleDraft.path !== image.path && image.path) {
        await supabase.storage.from("portfolio").remove([image.path])
      }

      // Remove old thumbnail from storage if replaced or cleared
      if (image.thumbnail_path && image.thumbnail_path !== (thumbnailDraft?.path ?? null)) {
        await supabase.storage.from("portfolio").remove([image.thumbnail_path])
      }

      const legacyPatch = {
        url: multiAngleDraft.url,
        path: multiAngleDraft.path,
        updated_at: new Date().toISOString(),
      }
      const thumbPatch = {
        ...legacyPatch,
        thumbnail_url: thumbnailDraft?.url ?? null,
        thumbnail_path: thumbnailDraft?.path ?? null,
      }
      const fullPatch = {
        ...thumbPatch,
        multiangle_url: multiAngleDraft.url,
        multiangle_path: multiAngleDraft.path,
      }
      console.log("[portfolio edit] update attempt:", {
        id: image.id,
        hasThumbnail: !!thumbnailDraft,
      })

      // Cascade: full (new cols) → thumb-only (drop multiangle) → legacy only.
      // Saves as much data as PostgREST's schema cache currently knows about.
      const tryUpdate = (patch: Updates<"portfolio_images">) =>
        supabase.from("portfolio_images").update(patch).eq("id", image.id)

      const r1 = await tryUpdate(fullPatch)
      if (r1.error && isNewColumnSchemaError(r1.error)) {
        console.warn("[portfolio edit] full failed:", r1.error.message, "→ trying thumb-only")
        const r2 = await tryUpdate(thumbPatch)
        if (r2.error && isNewColumnSchemaError(r2.error)) {
          console.warn("[portfolio edit] thumb-only failed:", r2.error.message, "→ trying legacy only")
          const r3 = await tryUpdate(legacyPatch)
          if (r3.error) throw r3.error
          console.warn("[portfolio edit] legacy-only succeeded — thumbnail NOT persisted")
        } else if (r2.error) {
          throw r2.error
        } else {
          console.log("[portfolio edit] thumb-only succeeded — thumbnail persisted, multiangle_* NOT")
        }
      } else if (r1.error) {
        throw r1.error
      } else {
        console.log("[portfolio edit] full succeeded — everything persisted")
      }

      toast.success("Portfolio photo updated")
      await revalidatePublic()
      onSuccess()
      handleOpenChange(false)
    } catch (err) {
      console.error("Portfolio edit error:", err)
      toast.error(readableError(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Portfolio Photo</DialogTitle>
          <DialogDescription>
            Update the thumbnail and multi-angle photo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Thumbnail Picture ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-amber-400 uppercase tracking-wider block">
              Thumbnail Picture <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-zinc-500">
              A single clean portrait shown as the gallery card preview.
            </p>
            <ImageUploader
              bucket="portfolio"
              folder={`${image?.category ?? "women"}/thumbnails`}
              currentUrl={thumbnailDraft?.url ?? null}
              onUploadComplete={(url, path) => setThumbnailDraft({ url, path })}
              onRemove={() => setThumbnailDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>

          {/* ── Multi-Angle Photo ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-blue-400 uppercase tracking-wider block">
              Multi-Angle Photo <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-zinc-500">
              The collage or multi-shot image shown in the full gallery view.
            </p>
            <ImageUploader
              bucket="portfolio"
              folder={image?.category ?? "women"}
              currentUrl={multiAngleDraft?.url ?? null}
              onUploadComplete={(url, path) => setMultiAngleDraft({ url, path })}
              onRemove={() => setMultiAngleDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={isSaving || !multiAngleDraft || !thumbnailDraft}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Category Tab Panel ───────────────────────────────────────────────────────

function CategoryPanel({
  category,
  onAddPhoto,
}: {
  category: Category
  onAddPhoto: () => void
}) {
  const queryClient = useQueryClient()

  const { data: images, isLoading } = useQuery<PortfolioImage[]>({
    queryKey: ["portfolio", category],
    queryFn: () => fetchPortfolioImages(category),
  })

  const [localOrder, setLocalOrder] = useState<string[] | null>(null)
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null)

  const orderedImages =
    localOrder && images
      ? [...images].sort(
          (a, b) => localOrder.indexOf(a.id) - localOrder.indexOf(b.id)
        )
      : images ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const supabase = createSupabaseClient()
      await Promise.all(
        orderedIds.map((id, idx) =>
          supabase
            .from("portfolio_images")
            .update({ display_order: idx })
            .eq("id", id)
        )
      )
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
      await revalidatePublic()
      setLocalOrder(null)
    },
    onError: (err: Error) => {
      toast.error(`Failed to save order: ${err.message}`)
      setLocalOrder(null)
    },
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (image: PortfolioImage) => {
      const supabase = createSupabaseClient()
      const patch: Updates<"portfolio_images"> = {
        featured: !image.featured,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from("portfolio_images")
        .update(patch)
        .eq("id", image.id)
      if (error) throw error
    },
    onSuccess: async (_, image) => {
      toast.success(image.featured ? "Removed from featured" : "Marked as featured")
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
      await revalidatePublic()
    },
    onError: (err: Error) => {
      toast.error(`Failed to update: ${err.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (image: PortfolioImage) => {
      const supabase = createSupabaseClient()

      // Collect all storage paths to remove
      const pathsToRemove: string[] = []
      if (image.path) pathsToRemove.push(image.path)

      // Include multi-angle paths
      const angles = parseAngles(image.multi_angle_images)
      for (const angle of angles) {
        if (angle.path) pathsToRemove.push(angle.path)
      }

      if (pathsToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("portfolio")
          .remove(pathsToRemove)
        if (storageError) {
          console.warn("Storage delete warning:", storageError.message)
        }
      }

      const { error } = await supabase
        .from("portfolio_images")
        .delete()
        .eq("id", image.id)
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success("Photo deleted")
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
      await revalidatePublic()
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`)
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !images) return

    const ids = orderedImages.map((img) => img.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const newIds = arrayMove(ids, oldIndex, newIndex)

    setLocalOrder(newIds)
    reorderMutation.mutate(newIds)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-zinc-800">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-3 border-t border-zinc-800">
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!orderedImages.length) {
    return (
      <EmptyState
        icon={<Grid3X3 className="h-7 w-7" />}
        title={`No ${CATEGORY_LABELS[category]} photos yet`}
        description="Upload your first photo to get started."
        action={
          <Button
            onClick={onAddPhoto}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </Button>
        }
      />
    )
  }

  return (
    <>
      <p className="text-xs text-zinc-600 mb-4">
        Drag the handle on the left of each row to reorder.{" "}
        {reorderMutation.isPending && (
          <span className="text-amber-400">Saving order…</span>
        )}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedImages.map((img) => img.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedImages.map((image) => {
              const angles = parseAngles(image.multi_angle_images)
              return (
                <SortableItem key={image.id} id={image.id}>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2 hover:border-zinc-700 transition-colors w-full">
                    {/* Thumbnail picture box */}
                    <div className="shrink-0 rounded-lg border-2 border-amber-500/40 bg-zinc-800 overflow-hidden w-[80px]">
                      <div className="bg-amber-500/20 px-1 py-1 text-center border-b border-amber-500/30">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Thumbnail</span>
                      </div>
                      <div className="h-16 w-full relative">
                        {image.thumbnail_url ? (
                          <img
                            src={image.thumbnail_url}
                            alt={image.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : image.url ? (
                          <>
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="h-full w-full object-cover opacity-60"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-end justify-center pb-1">
                              <span className="text-[8px] text-zinc-400 bg-zinc-900/80 px-1 rounded">fallback</span>
                            </div>
                          </>
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center gap-1">
                            <ImageIcon className="h-4 w-4 text-amber-500/30" />
                            <span className="text-[9px] text-zinc-600">Not set</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Multi-angle box */}
                    <div className="shrink-0 rounded-lg border-2 border-blue-500/40 bg-zinc-800 overflow-hidden w-[80px]">
                      <div className="bg-blue-500/20 px-1 py-1 text-center border-b border-blue-500/30">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Multi-angle</span>
                      </div>
                      <div className="h-16 w-full">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {image.title ? (
                          <p className="text-sm font-medium text-white truncate">{image.title}</p>
                        ) : (
                          <p className="text-sm text-zinc-600 italic">Untitled</p>
                        )}
                        <Badge variant={CATEGORY_BADGE_VARIANT[image.category]} className="text-[10px] shrink-0">
                          {CATEGORY_LABELS[image.category]}
                        </Badge>
                        {image.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 mr-1">
                        <span className="text-xs text-zinc-600 hidden sm:block">
                          {image.featured ? "Featured" : "Feature"}
                        </span>
                        <Switch
                          checked={image.featured}
                          onCheckedChange={() => toggleFeaturedMutation.mutate(image)}
                          disabled={toggleFeaturedMutation.isPending}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingImage(image)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 text-zinc-400 transition-colors"
                        title="Edit photos"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <ConfirmDelete
                        onConfirm={() => deleteMutation.mutate(image)}
                        itemName={image.title || "this photo"}
                        disabled={deleteMutation.isPending}
                      />
                    </div>
                  </div>
                </SortableItem>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <EditDialog
        image={editingImage}
        open={editingImage !== null}
        onOpenChange={(open) => { if (!open) setEditingImage(null) }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
          setEditingImage(null)
        }}
      />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Category>("women")
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: womenImages } = useQuery<PortfolioImage[]>({
    queryKey: ["portfolio", "women"],
    queryFn: () => fetchPortfolioImages("women"),
  })
  const { data: menImages } = useQuery<PortfolioImage[]>({
    queryKey: ["portfolio", "men"],
    queryFn: () => fetchPortfolioImages("men"),
  })
  const { data: bothImages } = useQuery<PortfolioImage[]>({
    queryKey: ["portfolio", "both"],
    queryFn: () => fetchPortfolioImages("both"),
  })

  const counts: Record<Category, number> = {
    women: womenImages?.length ?? 0,
    men: menImages?.length ?? 0,
    both: bothImages?.length ?? 0,
  }

  function handleUploadSuccess() {
    queryClient.invalidateQueries({ queryKey: ["portfolio", activeTab] })
  }

  return (
    <div>
      <PageHeader
        title="Portfolio Gallery"
        description="Upload and manage your hair salon portfolio photos."
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Category)}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <TabsList className="bg-zinc-800/60">
            {(["women", "men", "both"] as Category[]).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-2">
                {CATEGORY_LABELS[cat]}
                {counts[cat] > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none",
                      activeTab === cat
                        ? "bg-orange-500 text-zinc-950"
                        : "bg-zinc-700 text-zinc-400"
                    )}
                  >
                    {counts[cat]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <p className="text-xs text-zinc-600">
            {counts.women + counts.men + counts.both} total photos
          </p>
        </div>

        {(["women", "men", "both"] as Category[]).map((cat) => (
          <TabsContent key={cat} value={cat}>
            <CategoryPanel
              category={cat}
              onAddPhoto={() => {
                setActiveTab(cat)
                setDialogOpen(true)
              }}
            />
          </TabsContent>
        ))}
      </Tabs>

      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultCategory={activeTab}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
