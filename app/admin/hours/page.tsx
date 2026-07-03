"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Clock, Save } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

type OpeningHour = {
  id: string
  day: string
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  display_order: number
}

type HourDraft = {
  id: string
  day: string
  open_time: string
  close_time: string
  is_closed: boolean
  display_order: number
}

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

function sortByDay(rows: OpeningHour[]): OpeningHour[] {
  return [...rows].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  )
}

export default function HoursPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const [drafts, setDrafts] = useState<HourDraft[]>([])

  const { data: hours = [], isLoading } = useQuery<OpeningHour[]>({
    queryKey: ["hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opening_hours")
        .select("*")
        .order("display_order", { ascending: true })
      if (error) throw error
      return sortByDay(data ?? [])
    },
  })

  // Sync drafts when data loads
  useEffect(() => {
    if (hours.length > 0) {
      setDrafts(
        hours.map((h) => ({
          id: h.id,
          day: h.day,
          open_time: h.open_time ?? "09:00",
          close_time: h.close_time ?? "18:00",
          is_closed: h.is_closed,
          display_order: h.display_order,
        }))
      )
    }
  }, [hours])

  const saveMutation = useMutation({
    mutationFn: async (rows: HourDraft[]) => {
      const { error } = await supabase.from("opening_hours").upsert(
        rows.map((r) => ({
          id: r.id,
          day: r.day,
          open_time: r.open_time,
          close_time: r.close_time,
          is_closed: r.is_closed,
          display_order: r.display_order,
        })),
        { onConflict: "day" }
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hours"] })
      toast.success("Opening hours saved")
    },
    onError: () => toast.error("Failed to save opening hours"),
  })

  function updateDraft(day: string, patch: Partial<HourDraft>) {
    setDrafts((prev) =>
      prev.map((d) => (d.day === day ? { ...d, ...patch } : d))
    )
  }

  function handleSave() {
    saveMutation.mutate(drafts)
  }

  const orderedDrafts = [...drafts].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  )

  return (
    <div>
      <PageHeader
        title="Opening Hours"
        description="Set your regular weekly schedule."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {orderedDrafts.map((draft) => (
            <div
              key={draft.day}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Day name + closed toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-52 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="font-medium text-white text-sm">
                      {DAY_LABELS[draft.day]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`closed-${draft.day}`}
                      checked={draft.is_closed}
                      onCheckedChange={(checked) =>
                        updateDraft(draft.day, { is_closed: checked })
                      }
                    />
                    <Label
                      htmlFor={`closed-${draft.day}`}
                      className={`text-xs cursor-pointer ${
                        draft.is_closed ? "text-red-400" : "text-zinc-400"
                      }`}
                    >
                      {draft.is_closed ? "Closed" : "Open"}
                    </Label>
                  </div>
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <Label
                      htmlFor={`open-${draft.day}`}
                      className="text-xs text-zinc-500 shrink-0 w-10"
                    >
                      Opens
                    </Label>
                    <Input
                      id={`open-${draft.day}`}
                      type="time"
                      value={draft.open_time}
                      onChange={(e) =>
                        updateDraft(draft.day, { open_time: e.target.value })
                      }
                      disabled={draft.is_closed}
                      className="flex-1 min-w-0 disabled:opacity-40"
                    />
                  </div>
                  <span className="text-zinc-600 text-sm shrink-0">–</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Label
                      htmlFor={`close-${draft.day}`}
                      className="text-xs text-zinc-500 shrink-0 w-10"
                    >
                      Closes
                    </Label>
                    <Input
                      id={`close-${draft.day}`}
                      type="time"
                      value={draft.close_time}
                      onChange={(e) =>
                        updateDraft(draft.day, { close_time: e.target.value })
                      }
                      disabled={draft.is_closed}
                      className="flex-1 min-w-0 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="lg"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
