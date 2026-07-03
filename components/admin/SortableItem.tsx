"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface SortableItemProps {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function SortableItem({ id, children, className, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 group",
        isDragging && "opacity-50 z-50",
        className
      )}
    >
      {!disabled && (
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 py-1"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
