"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, CalendarX2, Clock } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePublic } from "@/lib/admin/revalidate-public"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type HolidayHour = {
  id: string
  name: string
  date: string
  is_closed: boolean
  custom_open_time: string | null
  custom_close_time: string | null
}

type HolidayForm = {
  name: string
  date: string
  is_closed: boolean
  custom_open_time: string
  custom_close_time: string
}

const EMPTY_FORM: HolidayForm = {
  name: "",
  date: "",
  is_closed: true,
  custom_open_time: "10:00",
  custom_close_time: "16:00",
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ""
  // Parse as UTC to avoid timezone shift
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function HolidaysPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HolidayHour | null>(null)
  const [form, setForm] = useState<HolidayForm>(EMPTY_FORM)

  // Fetch
  const { data: holidays = [], isLoading } = useQuery<HolidayHour[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_hours")
        .select("*")
        .order("date", { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  // Save
  const saveMutation = useMutation({
    mutationFn: async (values: HolidayForm) => {
      const payload = {
        name: values.name,
        date: values.date,
        is_closed: values.is_closed,
        custom_open_time: values.is_closed ? null : values.custom_open_time || null,
        custom_close_time: values.is_closed ? null : values.custom_close_time || null,
      }
      if (editingItem) {
        const { error } = await supabase
          .from("holiday_hours")
          .update(payload)
          .eq("id", editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("holiday_hours").insert(payload)
        if (error) throw error
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] })
      await revalidatePublic()
      toast.success(editingItem ? "Holiday updated" : "Holiday added")
      closeDialog()
    },
    onError: () => toast.error("Failed to save holiday"),
  })

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("holiday_hours").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] })
      await revalidatePublic()
      toast.success("Holiday deleted")
    },
    onError: () => toast.error("Failed to delete holiday"),
  })

  function openAdd() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(item: HolidayHour) {
    setEditingItem(item)
    setForm({
      name: item.name,
      date: item.date,
      is_closed: item.is_closed,
      custom_open_time: item.custom_open_time ?? "10:00",
      custom_close_time: item.custom_close_time ?? "16:00",
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingItem(null)
    setForm(EMPTY_FORM)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Please enter a holiday name")
      return
    }
    if (!form.date) {
      toast.error("Please select a date")
      return
    }
    saveMutation.mutate(form)
  }

  // Sort by date for display (already sorted from DB, but keep consistent)
  const upcoming = holidays.filter((h) => h.date >= new Date().toISOString().slice(0, 10))
  const past = holidays.filter((h) => h.date < new Date().toISOString().slice(0, 10))

  return (
    <div>
      <PageHeader
        title="Holiday Hours"
        description="Set special closures and adjusted hours for holidays."
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Holiday
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : holidays.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="h-8 w-8" />}
          title="No holiday hours set"
          description="Add holiday closures and adjusted hours so customers know when you're available."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Upcoming
              </h2>
              <div className="space-y-2">
                {upcoming.map((holiday) => (
                  <HolidayCard
                    key={holiday.id}
                    holiday={holiday}
                    onEdit={() => openEdit(holiday)}
                    onDelete={() => deleteMutation.mutate(holiday.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Past
              </h2>
              <div className="space-y-2 opacity-60">
                {past.map((holiday) => (
                  <HolidayCard
                    key={holiday.id}
                    holiday={holiday}
                    onEdit={() => openEdit(holiday)}
                    onDelete={() => deleteMutation.mutate(holiday.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="holiday-name">Holiday Name</Label>
              <Input
                id="holiday-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Christmas Day"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <div>
                <p className="text-sm font-medium text-white">Closed all day</p>
                <p className="text-xs text-zinc-400">Toggle off to set custom hours</p>
              </div>
              <Switch
                id="holiday-closed"
                checked={form.is_closed}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_closed: checked }))}
              />
            </div>

            {!form.is_closed && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="holiday-open">Opens at</Label>
                  <Input
                    id="holiday-open"
                    type="time"
                    value={form.custom_open_time}
                    onChange={(e) => setForm((f) => ({ ...f, custom_open_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="holiday-close">Closes at</Label>
                  <Input
                    id="holiday-close"
                    type="time"
                    value={form.custom_close_time}
                    onChange={(e) => setForm((f) => ({ ...f, custom_close_time: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editingItem ? "Save Changes" : "Add Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HolidayCard({
  holiday,
  onEdit,
  onDelete,
  isDeleting,
}: {
  holiday: HolidayHour
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
      {/* Date block */}
      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase leading-none">
          {new Date(holiday.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-lg font-bold text-white leading-none mt-0.5">
          {new Date(holiday.date + "T00:00:00").getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{holiday.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{formatDisplayDate(holiday.date)}</p>
        <div className="mt-1.5">
          {holiday.is_closed ? (
            <Badge variant="destructive">Closed</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {holiday.custom_open_time} – {holiday.custom_close_time}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-zinc-400 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <ConfirmDelete
          itemName={holiday.name}
          onConfirm={onDelete}
          disabled={isDeleting}
        />
      </div>
    </div>
  )
}
