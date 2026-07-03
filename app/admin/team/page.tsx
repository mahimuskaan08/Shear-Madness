"use client"

import { useState, useCallback } from "react"
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
import { Plus, Users, Pencil, GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createSupabaseClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/admin/PageHeader"
import { EmptyState } from "@/components/admin/EmptyState"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { ConfirmDelete } from "@/components/admin/ConfirmDelete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type TeamMember = {
  id: string
  name: string
  position: string
  bio: string
  image_url: string | null
  image_path: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface MemberFormState {
  name: string
  position: string
  bio: string
  image_url: string | null
  image_path: string | null
}

const DEFAULT_FORM: MemberFormState = {
  name: "",
  position: "",
  bio: "",
  image_url: null,
  image_path: null,
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function useTeam() {
  const supabase = createSupabaseClient()
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true })
      if (error) throw error
      return data as TeamMember[]
    },
  })
}

function MemberCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <Skeleton className="h-16 w-16 rounded-full bg-zinc-800" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-zinc-800" />
        <Skeleton className="h-3 w-24 bg-zinc-800" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-16 rounded-lg bg-zinc-800" />
        <Skeleton className="h-8 w-16 rounded-lg bg-zinc-800" />
      </div>
    </div>
  )
}

interface MemberDialogProps {
  trigger: React.ReactNode
  title: string
  initialValues?: MemberFormState
  onSave: (values: MemberFormState) => Promise<void>
  isSaving: boolean
}

function MemberDialog({
  trigger,
  title,
  initialValues = DEFAULT_FORM,
  onSave,
  isSaving,
}: MemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<MemberFormState>(initialValues)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) setForm(initialValues)
    },
    [initialValues]
  )

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!form.position.trim()) {
      toast.error("Position is required")
      return
    }
    await onSave(form)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Photo uploader */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Profile Photo</Label>
            <ImageUploader
              bucket="team-photos"
              folder="portraits"
              currentUrl={form.image_url}
              onUploadComplete={(url, path) =>
                setForm((f) => ({ ...f, image_url: url, image_path: path }))
              }
              onRemove={() =>
                setForm((f) => ({ ...f, image_url: null, image_path: null }))
              }
              aspectHint="Square recommended"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Full Name</Label>
            <Input
              placeholder="e.g. Mahi Patel"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Position / Role</Label>
            <Input
              placeholder="e.g. Senior Stylist"
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300 text-sm">Bio</Label>
            <Textarea
              placeholder="A short description about this team member…"
              value={form.bio}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
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
            {isSaving ? "Saving…" : "Save Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SortableMemberCardProps {
  member: TeamMember
  onEdit: (member: TeamMember) => void
  onDelete: () => void
  isDeleting: boolean
  isEditing: boolean
  editDialog: React.ReactNode
}

function SortableMemberCard({
  member,
  onDelete,
  isDeleting,
  editDialog,
}: SortableMemberCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-shadow",
        isDragging && "opacity-50 shadow-2xl shadow-black/50 z-50"
      )}
    >
      {/* Drag handle bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-800/40">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors touch-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {editDialog}
          <ConfirmDelete
            itemName={member.name}
            onConfirm={onDelete}
            disabled={isDeleting}
          />
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Avatar */}
        <div className="mb-4">
          {member.image_url ? (
            <img
              src={member.image_url}
              alt={member.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-zinc-700"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              <span className="text-lg font-semibold text-zinc-400">
                {getInitials(member.name)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-base font-semibold text-white leading-tight">
          {member.name}
        </h3>
        <p className="text-sm text-amber-400 mt-0.5">{member.position}</p>
        {member.bio && (
          <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  )
}

export default function TeamPage() {
  const queryClient = useQueryClient()
  const supabase = createSupabaseClient()
  const { data: members = [], isLoading } = useTeam()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const insertMutation = useMutation({
    mutationFn: async (values: MemberFormState) => {
      const maxOrder =
        members.length > 0
          ? Math.max(...members.map((m) => m.display_order))
          : 0
      const { error } = await supabase.from("team_members").insert({
        name: values.name.trim(),
        position: values.position.trim(),
        bio: values.bio.trim(),
        image_url: values.image_url,
        image_path: values.image_path,
        display_order: maxOrder + 1,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] })
      toast.success("Team member added")
    },
    onError: (err: Error) => toast.error(`Failed to add: ${err.message}`),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: MemberFormState
    }) => {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: values.name.trim(),
          position: values.position.trim(),
          bio: values.bio.trim(),
          image_url: values.image_url,
          image_path: values.image_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] })
      toast.success("Team member updated")
    },
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: async (member: TeamMember) => {
      if (member.image_path) {
        const { error: storageErr } = await supabase.storage
          .from("team-photos")
          .remove([member.image_path])
        if (storageErr) console.warn("Storage delete warning:", storageErr.message)
      }
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", member.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] })
      toast.success("Team member removed")
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  })

  const reorderMutation = useMutation({
    mutationFn: async (reordered: TeamMember[]) => {
      const updates = reordered.map((m, idx) =>
        supabase
          .from("team_members")
          .update({ display_order: idx + 1, updated_at: new Date().toISOString() })
          .eq("id", m.id)
      )
      const results = await Promise.all(updates)
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] })
      toast.error("Failed to save order")
    },
  })

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = members.findIndex((m) => m.id === active.id)
      const newIndex = members.findIndex((m) => m.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(members, oldIndex, newIndex)
      queryClient.setQueryData(["team"], reordered)
      reorderMutation.mutate(reordered)
    },
    [members, queryClient, reorderMutation]
  )

  return (
    <div>
      <PageHeader
        title="Team Members"
        description="Manage your staff profiles. Drag cards to reorder their display."
        action={
          <MemberDialog
            title="Add Team Member"
            onSave={async (values) => {
              await insertMutation.mutateAsync(values)
            }}
            isSaving={insertMutation.isPending}
            trigger={
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-1.5">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            }
          />
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MemberCardSkeleton key={i} />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No team members yet"
          description="Add your stylists and staff to showcase them on your website."
          action={
            <MemberDialog
              title="Add Team Member"
              onSave={async (values) => {
                await insertMutation.mutateAsync(values)
              }}
              isSaving={insertMutation.isPending}
              trigger={
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              }
            />
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={members.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((member) => (
                <SortableMemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => {}}
                  onDelete={() => deleteMutation.mutate(member)}
                  isDeleting={deleteMutation.isPending}
                  isEditing={updateMutation.isPending}
                  editDialog={
                    <MemberDialog
                      title="Edit Team Member"
                      initialValues={{
                        name: member.name,
                        position: member.position,
                        bio: member.bio ?? "",
                        image_url: member.image_url,
                        image_path: member.image_path,
                      }}
                      onSave={async (values) => {
                        await updateMutation.mutateAsync({
                          id: member.id,
                          values,
                        })
                      }}
                      isSaving={updateMutation.isPending}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-zinc-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
