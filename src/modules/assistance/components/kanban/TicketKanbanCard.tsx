import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import {
  resolveTicketPriority,
  resolveTicketType,
} from "@/modules/assistance/utils/glpiField"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import {
  TicketPriorityBadge,
  TicketTypeBadge,
} from "@/shared/components/layout/admin/TicketBadge"
import { cn } from "@/shared/lib/utils"
import { formatGlpiDate } from "@/shared/lib/formatDate"

interface TicketKanbanCardProps {
  ticket: GlpiTicketListItem
  onOpen: (ticketId: number) => void
}

export function TicketKanbanCard({ ticket, onOpen }: TicketKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: { type: "ticket", ticket },
  })

  const type = resolveTicketType(ticket.type)
  const priority = resolveTicketPriority(ticket.priority)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-shadow",
        "hover:border-border hover:shadow-md",
        isDragging && "z-10 opacity-60 shadow-lg ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Déplacer le ticket"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen(ticket.id)}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              #{ticket.id}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatGlpiDate(ticket.date || ticket.date_creation)}
            </span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm leading-snug font-medium">
            {ticket.name || "Sans titre"}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            <TicketTypeBadge label={type.label} id={type.id} />
            <TicketPriorityBadge label={priority.label} id={priority.id} />
          </div>
        </button>
      </div>
    </article>
  )
}
