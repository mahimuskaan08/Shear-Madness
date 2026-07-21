"use client"

import { useState, useCallback, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { Plus, Scissors, Eye, EyeOff, Pencil, Check, Loader2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SortableItem } from "@/components/admin/SortableItem"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
type Service = {
  id: string
  name: string
  price: string
  category: "womens" | "mens" | "treatments" | "bridal"
  display_order: number
  is_visible: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}
type ServiceCategory = "womens" | "mens" | "treatments" | "bridal"

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "womens", label: "Women's" },
  { value: "mens", label: "Men's" },
  { value: "treatments", label: "Treatments" },
  { value: "bridal", label: "Bridal" },
]

interface ServiceFormState {
  name: string
  price: string
  category: ServiceCategory
  is_visible: boolean
  image_url: string | null
}

const DEFAULT_FORM: ServiceFormState = {
  name: "",
  price: "",
  category: "womens",
  is_visible: true,
  image_url: null,
}

function useServices(category: ServiceCategory) {
  const supabase = createSupabaseClient()
  return useQuery({
    queryKey: ["services", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("category", category)
        .order("display_order", { ascending: true })
      if (error) throw error
      return data as Service[]
    },
  })
}

function ServiceRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
      <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
      <Skeleton className="h-4 w-48 bg-zinc-800" />
      <Skeleton className="h-4 w-20 bg-zinc-800 ml-auto" />
      <Skeleton className="h-5 w-9 rounded-full bg-zinc-800" />
      <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
      <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
    </div>
  )
}

interface ServiceDialogProps {
  trigger: React.ReactNode
  title: string
  initialValues?: ServiceFormState
  onSave: (values: ServiceFormState, closeDialog: () => void) => void
  isSaving: boolean
}

function ServiceDialog({
  trigger,
  title,
  initialValues = DEFAULT_FORM,
  onSave,
  isSaving,
}: ServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ServiceFormState>(initialValues)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) setForm(initialValues)
    },
    [initialValues]
  )

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Service name is required")
      return
    }
    if (!form.price.trim()) {
      toast.error("Price is required")
      return
    }
    onSave(form, () => setOpen(false))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Service Image</Label>
            <ImageUploader
              bucket="backgrounds"
              folder={`service-images/${form.category}`}
              currentUrl={form.image_url}
              onUploadComplete={(url) =>
                setForm((f) => ({ ...f, image_url: url }))
              }
              onRemove={() => setForm((f) => ({ ...f, image_url: null }))}
              aspectHint="Landscape photo works best"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Service Name</Label>
            <Input
              placeholder="e.g. Balayage & Toner"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Price</Label>
            <Input
              placeholder="e.g. From £85 or £45+"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, category: v as ServiceCategory }))
              }
            >
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Visible on website</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Hidden services won't appear in the menu
              </p>
            </div>
            <Switch
              checked={form.is_visible}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          >
            {isSaving ? "Saving…" : "Save Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PriceCellProps {
  service: Service
  onSave: (price: string) => void
  isSaving: boolean
}

function PriceCell({ service, onSave, isSaving }: PriceCellProps) {
  const [value, setValue] = useState(service.price)

  useEffect(() => {
    setValue(service.price)
  }, [service.price])

  const dirty = value.trim() !== service.price && value.trim().length > 0

  const commit = () => {
    if (dirty && !isSaving) onSave(value.trim())
  }

  return (
    <div className="flex items-center gap-1 w-32 justify-end">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit()
          }
          if (e.key === "Escape") {
            setValue(service.price)
          }
        }}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="£0"
        aria-label={`Price for ${service.name}`}
        className="h-8 w-20 bg-zinc-800/50 border-zinc-700 text-amber-400 text-sm font-mono text-right px-2"
      />
      {dirty && (
        <Button
          type="button"
          size="sm"
          onClick={commit}
          disabled={isSaving}
          className="h-8 px-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shrink-0"
          aria-label="Save price"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </>
          )}
        </Button>
      )}
    </div>
  )
}

interface CategoryPanelProps {
  category: ServiceCategory
}

function CategoryPanel({ category }: CategoryPanelProps) {
  const queryClient = useQueryClient()
  const supabase = createSupabaseClient()
  const { data: services = [], isLoading } = useServices(category)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const revalidatePublic = async () => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: ["/services", "/"] }),
      })
    } catch {
      // ISR fallback (revalidate=10) will still catch up
    }
  }

  // Returns true if Supabase's error indicates image_url isn't in the schema cache.
  // PostgREST uses code PGRST204 for schema-cache misses; also match the message text.
  const isImageColMissing = (err: unknown) => {
    if (!err || typeof err !== "object") return false
    const anyErr = err as { code?: string; message?: string; details?: string }
    if (anyErr.code === "PGRST204") return true
    const haystack = `${anyErr.message ?? ""} ${anyErr.details ?? ""}`
    return /image_url/i.test(haystack) && /schema cache|schema-cache/i.test(haystack)
  }

  const insertMutation = useMutation({
    mutationFn: async (values: ServiceFormState) => {
      const maxOrder =
        services.length > 0
          ? Math.max(...services.map((s) => s.display_order))
          : 0
      const base = {
        name: values.name.trim(),
        price: values.price.trim(),
        category: values.category,
        is_visible: values.is_visible,
        display_order: maxOrder + 1,
      }
      const withImage = { ...base, image_url: values.image_url }
      const first = await supabase.from("services").insert(withImage)
      if (first.error) {
        console.warn("services.insert(withImage) error:", first.error)
        if (isImageColMissing(first.error)) {
          const retry = await supabase.from("services").insert(base)
          if (retry.error) throw retry.error
          return { skippedImage: true }
        }
        throw first.error
      }
      return { skippedImage: false }
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["services", category] })
      await revalidatePublic()
      if (result.skippedImage) {
        toast.warning(
          "Service added, but image not linked. Run NOTIFY pgrst, 'reload schema'; in Supabase SQL Editor, then edit the service to attach the image."
        )
      } else {
        toast.success("Service added")
      }
    },
    onError: (err: Error) => toast.error(`Failed to add: ${err.message}`),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: ServiceFormState
    }) => {
      const base = {
        name: values.name.trim(),
        price: values.price.trim(),
        category: values.category,
        is_visible: values.is_visible,
        updated_at: new Date().toISOString(),
      }
      const withImage = { ...base, image_url: values.image_url }
      const first = await supabase.from("services").update(withImage).eq("id", id)
      if (first.error) {
        console.warn("services.update(withImage) error:", first.error)
        if (isImageColMissing(first.error)) {
          const retry = await supabase.from("services").update(base).eq("id", id)
          if (retry.error) throw retry.error
          return { skippedImage: true }
        }
        throw first.error
      }
      return { skippedImage: false }
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["services", category] })
      await revalidatePublic()
      if (result.skippedImage) {
        toast.warning(
          "Saved without image. Run NOTIFY pgrst, 'reload schema'; in Supabase SQL Editor, then try attaching the image again."
        )
      } else {
        toast.success("Service updated")
      }
    },
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", category] })
      toast.success("Service deleted")
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  })

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: string }) => {
      const { error } = await supabase
        .from("services")
        .update({ price, updated_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onMutate: async ({ id, price }) => {
      await queryClient.cancelQueries({ queryKey: ["services", category] })
      const previous = queryClient.getQueryData<Service[]>(["services", category])
      queryClient.setQueryData<Service[]>(["services", category], (old = []) =>
        old.map((s) => (s.id === id ? { ...s, price } : s))
      )
      return { previous }
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["services", category], ctx.previous)
      }
      toast.error(`Failed to save price: ${err.message}`)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["services", category] })
      await revalidatePublic()
      toast.success("Price saved — live on the website")
    },
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({
      id,
      is_visible,
    }: {
      id: string
      is_visible: boolean
    }) => {
      const { error } = await supabase
        .from("services")
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onMutate: async ({ id, is_visible }) => {
      await queryClient.cancelQueries({ queryKey: ["services", category] })
      const previous = queryClient.getQueryData<Service[]>(["services", category])
      queryClient.setQueryData<Service[]>(["services", category], (old = []) =>
        old.map((s) => (s.id === id ? { ...s, is_visible } : s))
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["services", category], ctx.previous)
      }
      toast.error("Failed to update visibility")
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (reordered: Service[]) => {
      const updates = reordered.map((s, idx) =>
        supabase
          .from("services")
          .update({ display_order: idx + 1, updated_at: new Date().toISOString() })
          .eq("id", s.id)
      )
      const results = await Promise.all(updates)
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["services", category] })
      toast.error("Failed to save order")
    },
  })

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = services.findIndex((s) => s.id === active.id)
      const newIndex = services.findIndex((s) => s.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(services, oldIndex, newIndex)
      queryClient.setQueryData(["services", category], reordered)
      reorderMutation.mutate(reordered)
    },
    [services, queryClient, category, reorderMutation]
  )

  const categoryLabel =
    CATEGORIES.find((c) => c.value === category)?.label ?? category

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-800/40">
        <span className="h-5 w-5 shrink-0" />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Service
          </span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right w-32 pr-2">
            Price
          </span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider w-16 text-center">
            Visible
          </span>
          <span className="w-8 shrink-0" />
          <span className="w-8 shrink-0" />
        </div>
      </div>

      {/* Rows */}
      {isLoading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <ServiceRowSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Scissors className="h-7 w-7" />}
          title={`No ${categoryLabel} services yet`}
          description="Add your first service to get started."
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {services.map((service) => (
              <SortableItem
                key={service.id}
                id={service.id}
                className="border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Thumbnail */}
                  <div className="h-9 w-12 rounded overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                    {service.image_url ? (
                      <img src={service.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Scissors className="h-3 w-3 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  {/* Name */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {service.name}
                    </span>
                    {!service.is_visible && (
                      <Badge
                        variant="outline"
                        className="text-xs border-zinc-700 text-zinc-500 shrink-0"
                      >
                        Hidden
                      </Badge>
                    )}
                  </div>

                  {/* Price (inline editable) */}
                  <PriceCell
                    service={service}
                    isSaving={
                      updatePriceMutation.isPending &&
                      updatePriceMutation.variables?.id === service.id
                    }
                    onSave={(price) =>
                      updatePriceMutation.mutate({ id: service.id, price })
                    }
                  />

                  {/* Visibility toggle */}
                  <div className="w-16 flex justify-center">
                    <button
                      type="button"
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      onClick={() =>
                        toggleVisibilityMutation.mutate({
                          id: service.id,
                          is_visible: !service.is_visible,
                        })
                      }
                      aria-label={
                        service.is_visible ? "Hide service" : "Show service"
                      }
                    >
                      {service.is_visible ? (
                        <Eye className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Edit */}
                  <ServiceDialog
                    title="Edit Service"
                    initialValues={{
                      name: service.name,
                      price: service.price,
                      category: service.category,
                      is_visible: service.is_visible,
                      image_url: service.image_url,
                    }}
                    onSave={(values, closeDialog) => {
                      updateMutation.mutate({ id: service.id, values }, { onSuccess: closeDialog })
                    }}
                    isSaving={updateMutation.isPending}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />

                  {/* Delete */}
                  <ConfirmDelete
                    itemName={service.name}
                    onConfirm={() => deleteMutation.mutate(service.id)}
                    disabled={deleteMutation.isPending}
                  />
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Add row */}
      <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-800/20">
        <ServiceDialog
          title="Add Service"
          initialValues={{ ...DEFAULT_FORM, category }}
          onSave={(values, closeDialog) => {
            insertMutation.mutate(values, { onSuccess: closeDialog })
          }}
          isSaving={insertMutation.isPending}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add service
            </Button>
          }
        />
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<ServiceCategory>("womens")

  return (
    <div>
      <PageHeader
        title="Services"
        description="Type a new price and click Save. Drag rows to reorder."
        action={
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            Visible
            <div className="h-2 w-2 rounded-full bg-zinc-600 ml-2" />
            Hidden
          </div>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ServiceCategory)}
      >
        <TabsList className="mb-6">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => (
          <TabsContent key={c.value} value={c.value}>
            <CategoryPanel category={c.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
