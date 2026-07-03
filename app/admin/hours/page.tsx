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
          open_time: h.open_time || "09:00",
          close_time: h.close_time || "18:00",
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
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orderedDrafts.map((draft) => (
            <div
              key={draft.day}
              className={`bg-white border rounded-2xl px-6 py-5 shadow-sm transition-colors ${
                draft.is_closed ? "border-red-200 bg-red-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Day name + toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-5 sm:w-56 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-5 w-5 text-gray-400 shrink-0" />
                    <span className="font-bold text-gray-900 text-base">
                      {DAY_LABELS[draft.day]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Switch
                      id={`closed-${draft.day}`}
                      checked={draft.is_closed}
                      onCheckedChange={(checked) =>
                        updateDraft(draft.day, { is_closed: checked })
                      }
                    />
                    <Label
                      htmlFor={`closed-${draft.day}`}
                      className={`text-sm font-semibold cursor-pointer ${
                        draft.is_closed ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {draft.is_closed ? "Closed" : "Open"}
                    </Label>
                  </div>
                </div>

                {/* Time inputs */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <Label
                      htmlFor={`open-${draft.day}`}
                      className="text-sm font-medium text-gray-500 shrink-0 w-14"
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
                      className="flex-1 min-w-0 disabled:opacity-40 text-base font-medium bg-gray-50 border-gray-200 rounded-xl h-11"
                    />
                  </div>
                  <span className="text-gray-300 text-lg shrink-0">–</span>
                  <div className="flex items-center gap-3 flex-1">
                    <Label
                      htmlFor={`close-${draft.day}`}
                      className="text-sm font-medium text-gray-500 shrink-0 w-14"
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
                      className="flex-1 min-w-0 disabled:opacity-40 text-base font-medium bg-gray-50 border-gray-200 rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              size="lg"
              className="bg-amber-500 hover:bg-amber-400 text-white px-8 h-12 text-base font-semibold rounded-xl"
            >
              <Save className="h-5 w-5" />
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
