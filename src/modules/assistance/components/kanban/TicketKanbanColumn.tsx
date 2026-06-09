import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import {
  KANBAN_COLUMN_STYLES,
  KANBAN_STATUS_LABELS,
  type KanbanStatusId,
} from "@/modules/assistance/constants/kanban"
import { TicketKanbanCard } from "@/modules/assistance/components/kanban/TicketKanbanCard"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"

interface TicketKanbanColumnProps {
  statusId: KanbanStatusId
  tickets: GlpiTicketListItem[]
  isLoading: boolean
  onOpenTicket: (ticketId: number) => void
  onAddTicket?: () => void
}

export function TicketKanbanColumn({
  statusId,
  tickets,
  isLoading,
  onOpenTicket,
  onAddTicket,
}: TicketKanbanColumnProps) {
  const styles = KANBAN_COLUMN_STYLES[statusId]
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${statusId}`,
    data: { type: "column", statusId },
  })

  return (
    <section className="flex min-h-[420px] min-w-[280px] flex-1 flex-col">
      <header
        className={cn(
          "mb-3 flex items-center justify-between rounded-xl border px-4 py-3",
          styles.header,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", styles.dot)} />
          <h2 className="text-sm font-semibold">
            {KANBAN_STATUS_LABELS[statusId]}
          </h2>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {isLoading ? "…" : tickets.length}
        </Badge>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/15 p-2 transition-colors",
          styles.body,
          isOver && "border-primary/50 bg-primary/5",
        )}
      >
        {onAddTicket && !isLoading && (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-dashed"
      onClick={onAddTicket}
    >
      <Plus className="size-4" />
      Ajouter 1 ticket
    </Button>
  )}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))
        ) : (
          <SortableContext
            items={tickets.map((ticket) => ticket.id)}
            strategy={verticalListSortingStrategy}
          >
            {tickets.map((ticket) => (
              <TicketKanbanCard
                key={ticket.id}
                ticket={ticket}
                onOpen={onOpenTicket}
              />
            ))}
          </SortableContext>
        )}

        {!isLoading && tickets.length === 0 && (
          <p className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun ticket
          </p>
        )}
      </div>
    </section>
  )
}
