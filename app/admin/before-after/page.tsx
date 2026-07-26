"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeftRight,
  Plus,
  Pencil,
  Loader2,
  GripVertical,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePublic } from "@/lib/admin/revalidate-public"
import { BeforeAfterSchema, type BeforeAfterFormData } from "@/lib/validations/schemas"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

type BeforeAfter = {
  id: string
  title: string
  before_image_url: string
  before_image_path: string
  after_image_url: string
  after_image_path: string
  display_order: number
}

function BeforeAfterDialog({
  item,
  children,
  onSuccess,
}: {
  item?: BeforeAfter
  children: React.ReactNode
  onSuccess: () => void
}) {
  const supabase = createSupabaseClient()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [beforeUrl, setBeforeUrl] = useState<string | null>(item?.before_image_url ?? null)
  const [beforePath, setBeforePath] = useState<string | null>(item?.before_image_path ?? null)
  const [afterUrl, setAfterUrl] = useState<string | null>(item?.after_image_url ?? null)
  const [afterPath, setAfterPath] = useState<string | null>(item?.after_image_path ?? null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BeforeAfterFormData>({
    resolver: zodResolver(BeforeAfterSchema),
    defaultValues: { title: item?.title ?? "" },
  })

  const handleOpen = (o: boolean) => {
    setOpen(o)
    if (o) {
      reset({ title: item?.title ?? "" })
      setBeforeUrl(item?.before_image_url ?? null)
      setBeforePath(item?.before_image_path ?? null)
      setAfterUrl(item?.after_image_url ?? null)
      setAfterPath(item?.after_image_path ?? null)
    }
  }

  const onSubmit = async (data: BeforeAfterFormData) => {
    if (!beforeUrl || !beforePath) {
      toast.error("Please upload a Before image")
      return
    }
    if (!afterUrl || !afterPath) {
      toast.error("Please upload an After image")
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: data.title,
        before_image_url: beforeUrl,
        before_image_path: beforePath,
        after_image_url: afterUrl,
        after_image_path: afterPath,
      }

      if (item) {
        const { error } = await supabase
          .from("before_after_gallery")
          .update(payload)
          .eq("id", item.id)
        if (error) throw error
        toast.success("Updated successfully")
      } else {
        const { data: existing } = await supabase
          .from("before_after_gallery")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1)
          .maybeSingle()

        const { error } = await supabase
          .from("before_after_gallery")
          .insert({ ...payload, display_order: (existing?.display_order ?? 0) + 1 })
        if (error) throw error
        toast.success("Added successfully")
      }

      setOpen(false)
      onSuccess()
      await revalidatePublic()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Transformation" : "Add Transformation"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Balayage Transformation" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Before Image</Label>
              <ImageUploader
                bucket="before-after"
                folder="before"
                currentUrl={beforeUrl}
                onUploadComplete={(url, path) => {
                  setBeforeUrl(url)
                  setBeforePath(path)
                }}
                onRemove={() => {
                  setBeforeUrl(null)
                  setBeforePath(null)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>After Image</Label>
              <ImageUploader
                bucket="before-after"
                folder="after"
                currentUrl={afterUrl}
                onUploadComplete={(url, path) => {
                  setAfterUrl(url)
                  setAfterPath(path)
                }}
                onRemove={() => {
                  setAfterUrl(null)
                  setAfterPath(null)
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {item ? "Save Changes" : "Add Transformation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SortableCard({
  item,
  onDelete,
  onSuccess,
}: {
  item: BeforeAfter
  onDelete: () => void
  onSuccess: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {/* Drag handle bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-800/40">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-zinc-200 flex-1 px-3 truncate">{item.title}</span>
        <div className="flex items-center gap-1">
          <BeforeAfterDialog item={item} onSuccess={onSuccess}>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </BeforeAfterDialog>
          <ConfirmDelete onConfirm={onDelete} itemName={item.title} />
        </div>
      </div>

      {/* Before/After preview */}
      <div className="grid grid-cols-2">
        <div className="relative">
          <img
            src={item.before_image_url}
            alt="Before"
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded font-medium">
            Before
          </div>
        </div>
        <div className="relative border-l border-zinc-700">
          <img
            src={item.after_image_url}
            alt="After"
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-amber-500/80 backdrop-blur-sm text-zinc-950 text-xs px-2 py-0.5 rounded font-medium">
            After
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BeforeAfterPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const { data: items, isLoading } = useQuery({
    queryKey: ["before-after"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("before_after_gallery")
        .select("*")
        .order("display_order", { ascending: true })
      if (error) throw error
      return data as BeforeAfter[]
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const reorderMutation = useMutation({
    mutationFn: async (reordered: BeforeAfter[]) => {
      const results = await Promise.all(
        reordered.map((item, idx) =>
          supabase
            .from("before_after_gallery")
            .update({ display_order: idx })
            .eq("id", item.id)
        )
      )
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onSuccess: async () => {
      await revalidatePublic()
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["before-after"] })
      toast.error("Failed to save order")
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !items) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    queryClient.setQueryData<BeforeAfter[]>(["before-after"], reordered)
    reorderMutation.mutate(reordered)
  }

  const deleteMutation = useMutation({
    mutationFn: async (item: BeforeAfter) => {
      await supabase.storage.from("before-after").remove([item.before_image_path, item.after_image_path])
      const { error } = await supabase
        .from("before_after_gallery")
        .delete()
        .eq("id", item.id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["before-after"] })
      await revalidatePublic()
      toast.success("Transformation deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["before-after"] })

  return (
    <div>
      <PageHeader
        title="Before & After Gallery"
        description="Showcase your transformations with side-by-side comparisons"
        action={
          <BeforeAfterDialog onSuccess={invalidate}>
            <Button>
              <Plus className="h-4 w-4" />
              Add Transformation
            </Button>
          </BeforeAfterDialog>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : !items?.length ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-8 w-8" />}
          title="No transformations yet"
          description="Add before & after photo pairs to showcase your work."
          action={
            <BeforeAfterDialog onSuccess={invalidate}>
              <Button>
                <Plus className="h-4 w-4" />
                Add Transformation
              </Button>
            </BeforeAfterDialog>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onDelete={() => deleteMutation.mutate(item)}
                  onSuccess={invalidate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
