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
} from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { type Tables, type Inserts, type Updates } from "@/lib/types/database"
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

type UploadDraft = {
  url: string
  path: string
} | null

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
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>(null)
  const [category, setCategory] = useState<Category>(defaultCategory)
  const [alt, setAlt] = useState("")
  const [title, setTitle] = useState("")
  const [featured, setFeatured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setUploadDraft(null)
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
    if (!uploadDraft) {
      toast.error("Please upload an image first.")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createSupabaseClient()

      // Get the current max display_order for this category
      const { data: existing } = await supabase
        .from("portfolio_images")
        .select("display_order")
        .eq("category", category)
        .order("display_order", { ascending: false })
        .limit(1)

      const nextOrder = (existing?.[0]?.display_order ?? -1) + 1

      const payload: Inserts<"portfolio_images"> = {
        url: uploadDraft.url,
        path: uploadDraft.path,
        alt: alt.trim() || "Portfolio image",
        title: title.trim() || "",
        category,
        featured,
        display_order: nextOrder,
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Portfolio Photo</DialogTitle>
          <DialogDescription>
            Upload a new image to your portfolio gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Image uploader */}
          <div>
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
              Photo
            </Label>
            <ImageUploader
              bucket="portfolio"
              folder={category}
              currentUrl={uploadDraft?.url ?? null}
              onUploadComplete={(url, path) => setUploadDraft({ url, path })}
              onRemove={() => setUploadDraft(null)}
              aspectHint="Portrait or square"
            />
          </div>

          {/* Category */}
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

          {/* Title */}
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

          {/* Alt text */}
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

          {/* Featured toggle */}
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
            disabled={isSaving || !uploadDraft}
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

// ─── Portfolio Image Card ─────────────────────────────────────────────────────

function PortfolioCard({
  image,
  onToggleFeatured,
  onDelete,
  isTogglingFeatured,
  isDeleting,
}: {
  image: PortfolioImage
  onToggleFeatured: (image: PortfolioImage) => void
  onDelete: (image: PortfolioImage) => void
  isTogglingFeatured: boolean
  isDeleting: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col transition-opacity",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      {/* Image preview */}
      <div className="relative aspect-[4/3] bg-zinc-800 overflow-hidden">
        <img
          src={image.url}
          alt={image.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {image.featured && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500 text-zinc-950 rounded-full px-2 py-0.5">
              <Star className="h-2.5 w-2.5 fill-current" />
              Featured
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={CATEGORY_BADGE_VARIANT[image.category]} className="text-[10px]">
            {CATEGORY_LABELS[image.category]}
          </Badge>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-zinc-800">
        <div className="min-w-0 flex-1">
          {image.title ? (
            <p className="text-xs font-medium text-zinc-200 truncate">{image.title}</p>
          ) : (
            <p className="text-xs text-zinc-600 italic truncate">No title</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Featured toggle */}
          <button
            type="button"
            onClick={() => onToggleFeatured(image)}
            disabled={isTogglingFeatured}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
              image.featured
                ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25"
                : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
            )}
            title={image.featured ? "Remove from featured" : "Mark as featured"}
          >
            <Star className={cn("h-3.5 w-3.5", image.featured && "fill-current")} />
          </button>

          {/* Delete */}
          <ConfirmDelete
            onConfirm={() => onDelete(image)}
            itemName={image.title || "this photo"}
          />
        </div>
      </div>
    </div>
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

  // Local optimistic order for drag-and-drop
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

      // Delete from storage first
      if (image.path) {
        const { error: storageError } = await supabase.storage
          .from("portfolio")
          .remove([image.path])
        // Non-fatal: file may already be gone
        if (storageError) {
          console.warn("Storage delete warning:", storageError.message)
        }
      }

      // Delete from database
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
      {/* Drag instruction */}
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
            {orderedImages.map((image) => (
              <SortableItem key={image.id} id={image.id}>
                {/* Inline row layout: image thumb + info + controls */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2 hover:border-zinc-700 transition-colors w-full">
                  {/* Thumb */}
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
                    {image.alt && image.alt !== "Portfolio image" && (
                      <p className="text-xs text-zinc-600 truncate mt-0.5">{image.alt}</p>
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
            ))}
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

  // Counts for badges
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
