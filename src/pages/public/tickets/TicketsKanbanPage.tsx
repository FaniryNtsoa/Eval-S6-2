import { useEffect } from "react"
import { Plus, RefreshCw, Ticket } from "lucide-react"

import { TicketKanbanBoard } from "@/modules/assistance/components/kanban/TicketKanbanBoard"
import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import { useCreateTicketModal } from "@/modules/assistance/context/CreateTicketModalContext"
import { usePublicTickets } from "@/modules/assistance/hooks/usePublicTickets"
import { TicketDetailSheet } from "@/pages/admin/tickets/TicketDetailSheet"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export function TicketsKanbanPage() {
  const { openCreateTicket, lastSuccess } = useCreateTicketModal()
  const {
    tickets,
    selectedTicket,
    selectedId,
    isLoadingList,
    isLoadingDetail,
    isUpdatingStatus,
    error,
    loadTickets,
    selectTicket,
    clearSelection,
    changeTicketStatus,
  } = usePublicTickets()

  useEffect(() => {
    if (lastSuccess) {
      void loadTickets()
    }
  }, [lastSuccess, loadTickets])

  const handleStatusChange = async (
    ticketId: number,
    statusId: KanbanStatusId,
    comment?: string,
  ) => {
    await changeTicketStatus({ ticketId, statusId, comment })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Ticket className="size-4" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Tableau des tickets
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Visualisez vos tickets en colonnes Kanban. Glissez-déposez pour
            changer de statut ou cliquez sur une carte pour voir le détail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadTickets()}
            disabled={isLoadingList}
          >
            <RefreshCw
              className={cn("size-4", isLoadingList && "animate-spin")}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TicketKanbanBoard
        tickets={tickets}
        isLoading={isLoadingList}
        isUpdatingStatus={isUpdatingStatus}
        onOpenTicket={(ticketId) => void selectTicket(ticketId)}
        onStatusChange={handleStatusChange}
        onAddTicket={openCreateTicket}
      />

      <TicketDetailSheet
        open={selectedId != null}
        onOpenChange={(open) => {
          if (!open) {
            clearSelection()
          }
        }}
        ticket={selectedTicket}
        isLoading={isLoadingDetail}
      />
    </div>
  )
}
