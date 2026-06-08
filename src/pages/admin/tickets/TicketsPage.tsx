import { useMemo, useState } from "react"
import { ChevronRight, RefreshCw, Search, Ticket } from "lucide-react"

import { useTickets } from "@/modules/assistance/hooks/useTickets"
import {
  resolveTicketPriority,
  resolveTicketStatus,
  resolveTicketType,
} from "@/modules/assistance/utils/glpiField"
import { TicketDetailSheet } from "@/pages/admin/tickets/TicketDetailSheet"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import {
  TicketPriorityBadge,
  TicketStatusBadge,
  TicketTypeBadge,
} from "@/shared/components/layout/admin/TicketBadge"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatGlpiDate } from "@/shared/lib/formatDate"
import { cn } from "@/shared/lib/utils"

export function TicketsPage() {
  const [search, setSearch] = useState("")
  const {
    tickets,
    selectedTicket,
    selectedId,
    isLoadingList,
    isLoadingDetail,
    error,
    loadTickets,
    selectTicket,
    clearSelection,
  } = useTickets()

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return tickets
    }

    return tickets.filter((ticket) => {
      const type = resolveTicketType(ticket.type).label.toLowerCase()
      const status = resolveTicketStatus(ticket.status).label.toLowerCase()
      const priority = resolveTicketPriority(ticket.priority).label.toLowerCase()

      return (
        String(ticket.id).includes(query) ||
        (ticket.name?.toLowerCase().includes(query) ?? false) ||
        (ticket.external_id?.toLowerCase().includes(query) ?? false) ||
        type.includes(query) ||
        status.includes(query) ||
        priority.includes(query)
      )
    })
  }, [search, tickets])

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Tickets"
        description="Liste des tickets GLPI actifs. Cliquez sur une ligne pour ouvrir la fiche détaillée."
      >
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
      </AdminPageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {isLoadingList ? "…" : tickets.length}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Ticket className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="sm:col-span-2">
          <CardContent className="pt-0">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par ID, titre, référence, statut…"
                className="h-10 bg-background pl-9"
                disabled={isLoadingList || tickets.length === 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Résultats</CardTitle>
              <CardDescription>
                {isLoadingList
                  ? "Chargement des tickets…"
                  : search.trim()
                    ? `${filteredTickets.length} ticket(s) sur ${tickets.length}`
                    : `${tickets.length} ticket(s) actif(s)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingList ? (
            <div className="space-y-0 divide-y">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-4 py-3.5">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 flex-1 max-w-xs" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="Aucun ticket"
              description="Aucun ticket actif trouvé dans GLPI."
            />
          ) : filteredTickets.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucun ticket ne correspond à « ${search.trim()} ».`}
              action={
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Effacer la recherche
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="hidden md:table-cell">Référence</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const type = resolveTicketType(ticket.type)
                  const status = resolveTicketStatus(ticket.status)
                  const priority = resolveTicketPriority(ticket.priority)
                  const isSelected = selectedId === ticket.id

                  return (
                    <TableRow
                      key={ticket.id}
                      className="group cursor-pointer"
                      data-state={isSelected ? "selected" : undefined}
                      onClick={() => void selectTicket(ticket.id)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium lg:max-w-xs">
                        {ticket.name || "—"}
                      </TableCell>
                      <TableCell>
                        <TicketTypeBadge label={type.label} id={type.id} />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          label={status.label}
                          id={status.id}
                        />
                      </TableCell>
                      <TableCell>
                        <TicketPriorityBadge
                          label={priority.label}
                          id={priority.id}
                        />
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                        {ticket.external_id || "—"}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {formatGlpiDate(ticket.date || ticket.date_creation)}
                      </TableCell>
                      <TableCell className="text-muted-foreground/50 group-hover:text-muted-foreground">
                        <ChevronRight className="size-4" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
