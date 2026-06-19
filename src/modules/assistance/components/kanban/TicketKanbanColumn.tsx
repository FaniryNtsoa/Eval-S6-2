import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import type {
  KanbanColumnConfig,
  KanbanLanguageCode,
} from "@/modules/kanban-config/types/kanban-config.types"
import { resolveColumnLabel } from "@/modules/kanban-config/utils/config"
import { darkenHexColor } from "@/modules/kanban-config/utils/color"
import { TicketKanbanCard } from "@/modules/assistance/components/kanban/TicketKanbanCard"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"

interface TicketKanbanColumnProps {
  statusId: KanbanStatusId
  columnConfig: KanbanColumnConfig
  displayLanguage: KanbanLanguageCode
  tickets: GlpiTicketListItem[]
  isLoading: boolean
  onOpenTicket: (ticketId: number) => void
  onAddTicket?: () => void
}



export function TicketKanbanColumn({
  statusId,
  columnConfig,
  displayLanguage,
  tickets,
  isLoading,
  onOpenTicket,
  onAddTicket,
}: TicketKanbanColumnProps) {
  const backgroundColor = columnConfig.backgroundColor
  const dotColor = darkenHexColor(backgroundColor)
  const columnLabel = resolveColumnLabel(columnConfig, displayLanguage)
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${statusId}`,
    data: { type: "column", statusId },
  })

  return (
    <section className="flex min-h-[420px] min-w-[280px] flex-1 flex-col">
      <header
        className="mb-3 flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ backgroundColor }}
      >
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <h2 className="text-sm font-semibold">{columnLabel}</h2>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {isLoading ? "…" : tickets.length}
        </Badge>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/60 p-2 transition-colors",
          isOver && "border-primary/50",
        )}
        style={{ backgroundColor }}
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
