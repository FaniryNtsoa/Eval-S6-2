import { useEffect } from "react"
import { RefreshCw, Ticket } from "lucide-react"

import { TicketKanbanBoard } from "@/modules/assistance/components/kanban/TicketKanbanBoard"
import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import { useCreateTicketModal } from "@/modules/assistance/context/CreateTicketModalContext"
import { KanbanLanguageSelector } from "@/modules/kanban-config/components/KanbanLanguageSelector"
import { useKanbanConfig } from "@/modules/kanban-config/hooks/useKanbanConfig"
import { useKanbanDisplayLanguage } from "@/modules/kanban-config/hooks/useKanbanDisplayLanguage"
import { buildColumnConfigMap } from "@/modules/kanban-config/utils/config"
import { usePublicTickets } from "@/modules/assistance/hooks/usePublicTickets"
import { TicketDetailSheet } from "@/pages/admin/tickets/TicketDetailSheet"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export function TicketsKanbanPage() {
  const { config: kanbanConfig } = useKanbanConfig()
  const columnConfigs = buildColumnConfigMap(kanbanConfig)
  const { displayLanguage, setDisplayLanguage } = useKanbanDisplayLanguage(
    kanbanConfig.languages,
  )
  const { openCreateTicket, lastSuccess } = useCreateTicketModal()
  const {
    tickets,
    selectedTicket,
    selectedCosts,
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
    supercost?: number,
  ) => {
    await changeTicketStatus({ ticketId, statusId, comment, supercost })
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
          <KanbanLanguageSelector
            languages={kanbanConfig.languages}
            value={displayLanguage}
            onChange={setDisplayLanguage}
          />
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
        columnConfigs={columnConfigs}
        displayLanguage={displayLanguage}
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
        costs={selectedCosts}
        isLoading={isLoadingDetail}
      />
    </div>
  )
}
