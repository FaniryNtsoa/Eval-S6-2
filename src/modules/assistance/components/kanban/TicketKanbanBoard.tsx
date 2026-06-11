import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

import { TicketKanbanColumn } from "@/modules/assistance/components/kanban/TicketKanbanColumn"
import { TicketStatusChangeDialog } from "@/modules/assistance/components/kanban/TicketStatusChangeDialog"
import {
  KANBAN_STATUSES,
  getStatusChangeDialogKind,
  toKanbanColumn,
  type KanbanStatusId,
  type StatusChangeDialogKind,
} from "@/modules/assistance/constants/kanban"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import type { KanbanColumnConfig } from "@/modules/kanban-config/types/kanban-config.types"
import {
  resolveTicketPriority,
  resolveTicketType,
} from "@/modules/assistance/utils/glpiField"
import {
  TicketPriorityBadge,
  TicketTypeBadge,
} from "@/shared/components/layout/admin/TicketBadge"

interface PendingStatusChange {
  ticketId: number
  ticketTitle: string
  fromColumn: KanbanStatusId
  toColumn: KanbanStatusId
  dialogKind: StatusChangeDialogKind
}

interface TicketKanbanBoardProps {
  columnConfigs: Record<KanbanStatusId, KanbanColumnConfig>
  tickets: GlpiTicketListItem[]
  isLoading: boolean
  isUpdatingStatus: boolean
  onOpenTicket: (ticketId: number) => void
  onStatusChange: (
    ticketId: number,
    statusId: KanbanStatusId,
    comment?: string,
  ) => Promise<void>
  onAddTicket: () => void
}

function parseColumnId(columnId: string | number): KanbanStatusId | null {
  if (typeof columnId !== "string" || !columnId.startsWith("column-")) {
    return null
  }

  const statusId = Number(columnId.replace("column-", ""))

  if (statusId === 1 || statusId === 2 || statusId === 6) {
    return statusId
  }

  return null
}

export function TicketKanbanBoard({
  columnConfigs,
  tickets,
  isLoading,
  isUpdatingStatus,
  onOpenTicket,
  onStatusChange,
  onAddTicket,
}: TicketKanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<GlpiTicketListItem | null>(
    null,
  )
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const ticketsByColumn = useMemo(() => {
    const grouped: Record<KanbanStatusId, GlpiTicketListItem[]> = {
      1: [],
      2: [],
      6: [],
    }

    for (const ticket of tickets) {
      const column = toKanbanColumn(
        typeof ticket.status === "number"
          ? ticket.status
          : ticket.status?.id,
      )
      grouped[column].push(ticket)
    }

    return grouped
  }, [tickets])

  const applyStatusChange = async (
    ticketId: number,
    toColumn: KanbanStatusId,
    comment?: string,
  ) => {
    await onStatusChange(ticketId, toColumn, comment)
    setPendingChange(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = event.active.data.current?.ticket as
      | GlpiTicketListItem
      | undefined

    setActiveTicket(ticket ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTicket(null)

    const { active, over } = event

    if (!over) {
      return
    }

    const ticket = active.data.current?.ticket as GlpiTicketListItem | undefined

    if (!ticket) {
      return
    }

    const fromColumn = toKanbanColumn(
      typeof ticket.status === "number" ? ticket.status : ticket.status?.id,
    )

    let toColumn = parseColumnId(over.id)

    if (!toColumn && over.data.current?.type === "ticket") {
      const overTicket = over.data.current.ticket as GlpiTicketListItem
      toColumn = toKanbanColumn(
        typeof overTicket.status === "number"
          ? overTicket.status
          : overTicket.status?.id,
      )
    }

    if (!toColumn || fromColumn === toColumn) {
      return
    }

    const dialogKind = getStatusChangeDialogKind(fromColumn, toColumn)

    if (dialogKind) {
      setPendingChange({
        ticketId: ticket.id,
        ticketTitle: ticket.name || `Ticket #${ticket.id}`,
        fromColumn,
        toColumn,
        dialogKind,
      })
      return
    }

    void applyStatusChange(ticket.id, toColumn)
  }

  const overlayType = activeTicket
    ? resolveTicketType(activeTicket.type)
    : null
  const overlayPriority = activeTicket
    ? resolveTicketPriority(activeTicket.priority)
    : null

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {KANBAN_STATUSES.map((statusId) => (
            <TicketKanbanColumn
              key={statusId}
              statusId={statusId}
              columnConfig={columnConfigs[statusId]}
              tickets={ticketsByColumn[statusId]}
              isLoading={isLoading}
              onOpenTicket={onOpenTicket}
              onAddTicket={statusId === 1 ? onAddTicket : undefined}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTicket ? (
            <div className="w-[280px] rounded-xl border border-border bg-card p-3 shadow-xl">
              <p className="mb-1 font-mono text-[11px] text-muted-foreground">
                #{activeTicket.id}
              </p>
              <p className="mb-2 line-clamp-2 text-sm font-medium">
                {activeTicket.name || "Sans titre"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {overlayType && (
                  <TicketTypeBadge
                    label={overlayType.label}
                    id={overlayType.id}
                  />
                )}
                {overlayPriority && (
                  <TicketPriorityBadge
                    label={overlayPriority.label}
                    id={overlayPriority.id}
                  />
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TicketStatusChangeDialog
        open={pendingChange != null}
        kind={pendingChange?.dialogKind ?? null}
        ticketTitle={pendingChange?.ticketTitle}
        isSubmitting={isUpdatingStatus}
        onOpenChange={(open) => {
          if (!open) {
            setPendingChange(null)
          }
        }}
        onConfirm={async (comment) => {
          if (!pendingChange) {
            return
          }

          await applyStatusChange(
            pendingChange.ticketId,
            pendingChange.toColumn,
            comment,
          )
        }}
      />
    </>
  )
}
