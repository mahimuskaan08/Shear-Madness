"use client"

import { useState } from "react"
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

const CATEGORY_BADGE_VARIANT: Record<Category, "default" | "secondary" | "success"> = {
  women: "default",
  men: "success",
  both: "secondary",
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
  const [displayDraft, setDisplayDraft] = useState<UploadDraft>(null)
  const [angleDrafts, setAngleDrafts] = useState<AngleDraft[]>([])
  const [addingAngle, setAddingAngle] = useState(false)
  const [category, setCategory] = useState<Category>(defaultCategory)
  const [alt, setAlt] = useState("")
  const [title, setTitle] = useState("")
  const [featured, setFeatured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setDisplayDraft(null)
    setAngleDrafts([])
    setAddingAngle(false)
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

  function removeAngle(idx: number) {
    setAngleDrafts((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (!displayDraft) {
      toast.error("Please upload a display picture first.")
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

      const payload: Inserts<"portfolio_images"> = {
        url: displayDraft.url,
        path: displayDraft.path,
        alt: alt.trim() || "Portfolio image",
        title: title.trim() || "",
        category,
        featured,
        display_order: nextOrder,
        multi_angle_images: angleDrafts as Json,
      }
      const { error } = await supabase.from("portfolio_images").insert(payload)

      if (error) throw error

      toast.success("Photo added to portfolio")
      onSuccess()
      handleOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save image")
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
            Upload a display picture and optional multi-angle shots.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Display Picture ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
              Display Picture <span className="text-red-400">*</span>
            </Label>
            <p className="text-xs text-zinc-500">
              The main thumbnail shown in the gallery card.
            </p>
            <ImageUploader
              bucket="portfolio"
              folder={category}
              currentUrl={displayDraft?.url ?? null}
              onUploadComplete={(url, path) => setDisplayDraft({ url, path })}
              onRemove={() => setDisplayDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>

          {/* ── Multi-Angle Pictures ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
              Multi-Angle Pictures{" "}
              <span className="text-zinc-600 normal-case font-normal">(optional)</span>
            </Label>
            <p className="text-xs text-zinc-500">
              Extra shots from different angles shown when the photo is expanded.
            </p>

            {/* Uploaded angle thumbnails */}
            {angleDrafts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {angleDrafts.map((draft, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group"
                  >
                    <img
                      src={draft.url}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAngle(idx)}
                      className="absolute top-0.5 right-0.5 rounded-full bg-zinc-900/80 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/90 transition-all"
                    >
                      <X className="h-2.5 w-2.5 text-white" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] font-bold text-white bg-zinc-900/70 rounded px-1">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Inline angle uploader */}
            {addingAngle ? (
              <div className="space-y-2">
                <ImageUploader
                  bucket="portfolio"
                  folder={`${category}/angles`}
                  currentUrl={null}
                  onUploadComplete={(url, path) => {
                    setAngleDrafts((prev) => [...prev, { url, path }])
                    setAddingAngle(false)
                  }}
                  onRemove={() => setAddingAngle(false)}
                  aspectHint="Portrait or square"
                />
                <button
                  type="button"
                  onClick={() => setAddingAngle(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingAngle(true)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                {angleDrafts.length === 0 ? "Add angle photo" : "Add another angle"}
              </button>
            )}
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
            <Switch
              checked={featured}
              onCheckedChange={setFeatured}
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
            disabled={isSaving || !displayDraft}
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
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
    onSuccess: (_, image) => {
      toast.success(image.featured ? "Removed from featured" : "Marked as featured")
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
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
    onSuccess: () => {
      toast.success("Photo deleted")
      queryClient.invalidateQueries({ queryKey: ["portfolio", category] })
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
                    {/* Display picture thumb */}
                    <div className="h-14 w-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
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
                      {/* Angle count */}
                      {angles.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                          <Images className="h-3 w-3" />
                          {angles.length} angle{angles.length !== 1 ? "s" : ""}
                        </span>
                      )}
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
                        ? "bg-amber-500 text-zinc-950"
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
