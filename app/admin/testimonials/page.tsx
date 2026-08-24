"use client"

import { useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Plus, Pencil, Loader2, ClipboardPaste } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePublic } from "@/lib/admin/revalidate-public"
import { TestimonialSchema, type TestimonialFormData } from "@/lib/validations/schemas"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ReviewSource = "google" | "fresha"

type Testimonial = {
  id: string
  customer_name: string
  customer_photo_path: string | null
  review: string
  rating: number
  source: ReviewSource
  is_visible: boolean
  created_at: string
}

const SOURCES: { key: ReviewSource; label: string }[] = [
  { key: "google", label: "Google Review" },
  { key: "fresha", label: "Fresha Review" },
]

function sourceLabel(source: ReviewSource | null | undefined) {
  return SOURCES.find((s) => s.key === source)?.label ?? "Google Review"
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange?: (v: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={cn(
            "transition-colors",
            s <= value ? "text-amber-400" : "text-gray-200",
            onChange && "hover:text-amber-300 cursor-pointer"
          )}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  )
}

function TestimonialDialog({
  item,
  children,
  onSuccess,
}: {
  item?: Testimonial
  children: React.ReactNode
  onSuccess: () => void
}) {
  const supabase = createSupabaseClient()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const reviewRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(TestimonialSchema),
    defaultValues: {
      customer_name: item?.customer_name ?? "",
      review: item?.review ?? "",
      rating: item?.rating ?? 5,
      source: item?.source ?? "google",
      is_visible: item?.is_visible ?? true,
    },
  })

  const rating = watch("rating")
  const source = watch("source")
  const review = watch("review")
  const isVisible = watch("is_visible")

  const { ref: registerReviewRef, ...reviewField } = register("review")

  const handleOpen = (o: boolean) => {
    setOpen(o)
    if (o) {
      reset({
        customer_name: item?.customer_name ?? "",
        review: item?.review ?? "",
        rating: item?.rating ?? 5,
        source: item?.source ?? "google",
        is_visible: item?.is_visible ?? true,
      })
    }
  }

  // Some browsers block Ctrl+V into a modal (or the client is on a device where
  // the shortcut is awkward), so offer an explicit button that reads the
  // clipboard and drops the text straight into the review box.
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        toast.error("Your clipboard is empty. Copy the review first, then press Paste.")
        return
      }
      setValue("review", text.trim(), { shouldValidate: true, shouldDirty: true })
      reviewRef.current?.focus()
    } catch {
      toast.error(
        "Your browser blocked clipboard access. Click inside the Review box and press Ctrl+V (Cmd+V on Mac)."
      )
    }
  }

  const onSubmit = async (data: TestimonialFormData) => {
    setSaving(true)
    try {
      if (item) {
        const { error } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", item.id)
        if (error) throw error
        toast.success("Testimonial updated")
      } else {
        const { error } = await supabase.from("testimonials").insert(data)
        if (error) throw error
        toast.success("Testimonial added")
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
      <DialogContent
        className="max-w-lg"
        // A right-click "Paste", a browser autofill dropdown or a stray click
        // outside used to dismiss the dialog and throw away the review being
        // entered. Only Cancel, the X and Escape close it now.
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{item ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          <DialogDescription>
            Copy a review from Google or Fresha and paste it below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" placeholder="Jane Smith" {...register("customer_name")} />
            {errors.customer_name && (
              <p className="text-xs text-red-400">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Where is this review from?</Label>
            <div className="flex flex-wrap gap-3">
              {SOURCES.map((s) => (
                <label
                  key={s.key}
                  htmlFor={`source-${s.key}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors",
                    source === s.key
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  )}
                >
                  <Checkbox
                    id={`source-${s.key}`}
                    checked={source === s.key}
                    // Only one source applies to a review, so checking one
                    // clears the other and unchecking is a no-op.
                    onCheckedChange={(checked) => {
                      if (checked) setValue("source", s.key, { shouldValidate: true })
                    }}
                  />
                  <span className="text-sm text-zinc-200">{s.label}</span>
                </label>
              ))}
            </div>
            {errors.source && (
              <p className="text-xs text-red-400">{errors.source.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={(v) => setValue("rating", v)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="review">Review</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pasteFromClipboard}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste
              </Button>
            </div>
            <Textarea
              id="review"
              placeholder="The team at Shear Madness is absolutely amazing…"
              rows={6}
              className="resize-y"
              autoComplete="off"
              spellCheck={false}
              {...reviewField}
              ref={(el) => {
                registerReviewRef(el)
                reviewRef.current = el
              }}
            />
            <div className="flex items-center justify-between gap-2">
              {errors.review ? (
                <p className="text-xs text-red-400">{errors.review.message}</p>
              ) : (
                <p className="text-xs text-zinc-500">
                  Paste with Ctrl+V (Cmd+V on Mac) or use the Paste button.
                </p>
              )}
              <span
                className={cn(
                  "text-xs shrink-0",
                  (review?.length ?? 0) > 2000 ? "text-red-400" : "text-zinc-500"
                )}
              >
                {review?.length ?? 0}/2000
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={isVisible}
              onCheckedChange={(v) => setValue("is_visible", v)}
            />
            <Label>Show on website</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {item ? "Save Changes" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TestimonialsPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as Testimonial[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (t: Testimonial) => {
      // Photos are no longer collected, but older rows may still have one.
      if (t.customer_photo_path) {
        await supabase.storage.from("testimonial-photos").remove([t.customer_photo_path])
      }
      const { error } = await supabase.from("testimonials").delete().eq("id", t.id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] })
      await revalidatePublic()
      toast.success("Testimonial deleted")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleVisibility = useMutation({
    mutationFn: async (t: Testimonial) => {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_visible: !t.is_visible })
        .eq("id", t.id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] })
      await revalidatePublic()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["testimonials"] })

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Manage customer reviews displayed on your website"
        action={
          <TestimonialDialog onSuccess={invalidate}>
            <Button>
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </TestimonialDialog>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !testimonials?.length ? (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No testimonials yet"
          description="Add your first customer review to display on the website."
          action={
            <TestimonialDialog onSuccess={invalidate}>
              <Button>
                <Plus className="h-4 w-4" />
                Add Review
              </Button>
            </TestimonialDialog>
          }
        />
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">{t.customer_name}</span>
                    <Badge variant="outline" className="border-gray-200 text-gray-500">
                      {sourceLabel(t.source)}
                    </Badge>
                    {!t.is_visible && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                  <StarRating value={t.rating} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={t.is_visible}
                    onCheckedChange={() => toggleVisibility.mutate(t)}
                  />
                  <TestimonialDialog item={t} onSuccess={invalidate}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TestimonialDialog>
                  <ConfirmDelete
                    onConfirm={() => deleteMutation.mutate(t)}
                    itemName={t.customer_name}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mt-2">{t.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
