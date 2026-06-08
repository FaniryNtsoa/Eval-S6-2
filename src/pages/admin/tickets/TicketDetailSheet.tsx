import type { ReactNode } from "react"
import { Calendar, Clock, Hash, Tag } from "lucide-react"

import {
  resolveTicketPriority,
  resolveTicketStatus,
  resolveTicketType,
  stripHtml,
} from "@/modules/assistance/utils/glpiField"
import type { GlpiTicketDetail } from "@/modules/assistance/types/ticket.types"
import {
  TicketPriorityBadge,
  TicketStatusBadge,
  TicketTypeBadge,
} from "@/shared/components/layout/admin/TicketBadge"
import { Separator } from "@/shared/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatGlpiDate, formatGlpiDateTime } from "@/shared/lib/formatDate"

interface TicketDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: GlpiTicketDetail | null
  isLoading: boolean
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

export function TicketDetailSheet({
  open,
  onOpenChange,
  ticket,
  isLoading,
}: TicketDetailSheetProps) {
  const type = ticket ? resolveTicketType(ticket.type) : null
  const status = ticket ? resolveTicketStatus(ticket.status) : null
  const priority = ticket ? resolveTicketPriority(ticket.priority) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b bg-muted/20 px-6 py-5">
          <SheetTitle className="pr-8 text-left text-lg leading-snug">
            {isLoading ? (
              <Skeleton className="h-7 w-3/4" />
            ) : (
              ticket?.name || "Ticket sans titre"
            )}
          </SheetTitle>
          <SheetDescription className="text-left">
            {ticket ? (
              <span className="font-mono text-xs">Ticket #{ticket.id}</span>
            ) : (
              "Chargement…"
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : ticket ? (
            <>
              <div className="flex flex-wrap gap-2">
                <TicketTypeBadge label={type?.label ?? "—"} id={type?.id} />
                <TicketStatusBadge
                  label={status?.label ?? "—"}
                  id={status?.id}
                />
                <TicketPriorityBadge
                  label={priority?.label ?? "—"}
                  id={priority?.id}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Référence"
                  icon={Hash}
                  value={
                    <span className="font-mono text-xs">
                      {ticket.external_id || "—"}
                    </span>
                  }
                />
                <DetailRow
                  label="ID GLPI"
                  icon={Tag}
                  value={<span className="font-mono text-xs">#{ticket.id}</span>}
                />
                <DetailRow
                  label="Date"
                  icon={Calendar}
                  value={formatGlpiDate(ticket.date || ticket.date_creation)}
                />
                <DetailRow
                  label="Dernière modification"
                  icon={Clock}
                  value={formatGlpiDateTime(ticket.date_mod)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Description
                </p>
                <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {stripHtml(ticket.content)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Impossible de charger ce ticket.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
