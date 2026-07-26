"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { toast } from "sonner"
import { Plus, Pencil, ChevronDown, ChevronUp, HelpCircle, Eye, EyeOff } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePublic } from "@/lib/admin/revalidate-public"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { SortableItem } from "@/components/admin/SortableItem"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type FAQ = {
  id: string
  question: string
  answer: string
  display_order: number
  is_visible: boolean
}

type FAQForm = {
  question: string
  answer: string
}

const EMPTY_FORM: FAQForm = { question: "", answer: "" }

export default function FAQPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FAQ | null>(null)
  const [form, setForm] = useState<FAQForm>(EMPTY_FORM)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Fetch
  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .order("display_order", { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  // Save (insert or update)
  const saveMutation = useMutation({
    mutationFn: async (values: FAQForm) => {
      if (editingItem) {
        const { error } = await supabase
          .from("faq")
          .update({ question: values.question, answer: values.answer })
          .eq("id", editingItem.id)
        if (error) throw error
      } else {
        const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.display_order)) + 1 : 0
        const { error } = await supabase
          .from("faq")
          .insert({ question: values.question, answer: values.answer, display_order: nextOrder, is_visible: true })
        if (error) throw error
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] })
      await revalidatePublic()
      toast.success(editingItem ? "Question updated" : "Question added")
      closeDialog()
    },
    onError: () => toast.error("Failed to save question"),
  })

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] })
      await revalidatePublic()
      toast.success("Question deleted")
    },
    onError: () => toast.error("Failed to delete question"),
  })

  // Toggle visibility
  const toggleVisibleMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase.from("faq").update({ is_visible }).eq("id", id)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] })
      await revalidatePublic()
    },
    onError: () => toast.error("Failed to update visibility"),
  })

  // Reorder
  const reorderMutation = useMutation({
    mutationFn: async (items: FAQ[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index,
        question: item.question,
        answer: item.answer,
        is_visible: item.is_visible,
      }))
      const { error } = await supabase.from("faq").upsert(updates)
      if (error) throw error
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] })
      await revalidatePublic()
    },
    onError: () => toast.error("Failed to save order"),
  })

  function openAdd() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(item: FAQ) {
    setEditingItem(item)
    setForm({ question: item.question, answer: item.answer })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingItem(null)
    setForm(EMPTY_FORM)
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = faqs.findIndex((f) => f.id === active.id)
    const newIndex = faqs.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(faqs, oldIndex, newIndex)
    queryClient.setQueryData<FAQ[]>(["faq"], reordered)
    reorderMutation.mutate(reordered)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    saveMutation.mutate(form)
  }

  return (
    <div>
      <PageHeader
        title="FAQ"
        description="Manage frequently asked questions shown on your website."
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="h-8 w-8" />}
          title="No questions yet"
          description="Add your first FAQ to help customers find answers quickly."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={faqs.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {faqs.map((faq) => {
                const isExpanded = expandedIds.has(faq.id)
                return (
                  <SortableItem key={faq.id} id={faq.id}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Visibility toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleVisibleMutation.mutate({ id: faq.id, is_visible: !faq.is_visible })
                          }
                          className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                          title={faq.is_visible ? "Hide" : "Show"}
                        >
                          {faq.is_visible ? (
                            <Eye className="h-4 w-4 text-amber-400" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>

                        {/* Question text */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(faq.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <span className={`text-sm font-medium ${faq.is_visible ? "text-white" : "text-zinc-500"}`}>
                            {faq.question}
                          </span>
                        </button>

                        {!faq.is_visible && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Hidden
                          </Badge>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(faq)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <ConfirmDelete
                            itemName={faq.question}
                            onConfirm={() => deleteMutation.mutate(faq.id)}
                            disabled={deleteMutation.isPending}
                          />
                          <button
                            type="button"
                            onClick={() => toggleExpand(faq.id)}
                            className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded answer */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-zinc-800">
                          <p className="text-sm text-zinc-400 mt-3 leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </SortableItem>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="e.g. Do you accept walk-ins?"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Write the answer here..."
                rows={5}
                className="resize-none bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-amber-400/50 focus:border-amber-400/50"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editingItem ? "Save Changes" : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
