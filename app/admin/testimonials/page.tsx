"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Plus, Pencil, Loader2, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createSupabaseClient } from "@/lib/supabase/client"
import { TestimonialSchema, type TestimonialFormData } from "@/lib/validations/schemas"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Testimonial = {
  id: string
  customer_name: string
  customer_photo_url: string | null
  customer_photo_path: string | null
  review: string
  rating: number
  is_visible: boolean
  created_at: string
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(item?.customer_photo_url ?? null)
  const [photoPath, setPhotoPath] = useState<string | null>(item?.customer_photo_path ?? null)
  const [saving, setSaving] = useState(false)

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
      is_visible: item?.is_visible ?? true,
    },
  })

  const rating = watch("rating")
  const isVisible = watch("is_visible")

  const handleOpen = (o: boolean) => {
    setOpen(o)
    if (o) {
      reset({
        customer_name: item?.customer_name ?? "",
        review: item?.review ?? "",
        rating: item?.rating ?? 5,
        is_visible: item?.is_visible ?? true,
      })
      setPhotoUrl(item?.customer_photo_url ?? null)
      setPhotoPath(item?.customer_photo_path ?? null)
    }
  }

  const onSubmit = async (data: TestimonialFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        customer_photo_url: photoUrl,
        customer_photo_path: photoPath,
      }

      if (item) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", item.id)
        if (error) throw error
        toast.success("Testimonial updated")
      } else {
        const { error } = await supabase.from("testimonials").insert(payload)
        if (error) throw error
        toast.success("Testimonial added")
      }

      setOpen(false)
      onSuccess()
    } catch (e: unknown) {
      toast.error((e as Error).message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Customer Photo (optional)</Label>
            <ImageUploader
              bucket="testimonial-photos"
              folder="customers"
              currentUrl={photoUrl}
              onUploadComplete={(url, path) => {
                setPhotoUrl(url)
                setPhotoPath(path)
              }}
              onRemove={() => {
                setPhotoUrl(null)
                setPhotoPath(null)
              }}
              aspectHint="Square preferred"
            />
          </div>

          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input placeholder="Jane Smith" {...register("customer_name")} />
            {errors.customer_name && (
              <p className="text-xs text-red-400">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={(v) => setValue("rating", v)} />
          </div>

          <div className="space-y-2">
            <Label>Review</Label>
            <Textarea
              placeholder="The team at Shear Madness is absolutely amazing…"
              rows={4}
              {...register("review")}
            />
            {errors.review && (
              <p className="text-xs text-red-400">{errors.review.message}</p>
            )}
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
      if (t.customer_photo_path) {
        await supabase.storage.from("testimonial-photos").remove([t.customer_photo_path])
      }
      const { error } = await supabase.from("testimonials").delete().eq("id", t.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] })
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
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
              className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-5 shadow-sm"
            >
              {/* Avatar */}
              <div className="shrink-0">
                {t.customer_photo_url ? (
                  <img
                    src={t.customer_photo_url}
                    alt={t.customer_name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-base">{t.customer_name}</span>
                      {!t.is_visible && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
