import { formatItemTypeLabel } from "@/modules/assistance/constants/ticket-labels"
import {
  fetchPublicTicketCosts,
  fetchPublicTickets,
} from "@/modules/assistance/services/publicTicketService"
import type { ItemTypeCostRow } from "@/modules/costs/types/cost-aggregation.types"
import { sumGlpiCosts } from "@/modules/assistance/utils/ticketCost"
import { fetchAllSupercosts } from "@/modules/kanban-config/services/kanbanConfigService"
import { listItemTicketsForTicket } from "@/modules/import/common/services/legacyItemTicketService"

function sumByTicket(
  entries: { ticketId: number; amount: number; movementType: string }[],
  movementType: string,
): Record<number, number> {
  const totals: Record<number, number> = {}

  for (const entry of entries) {
    const type = entry.movementType ?? "SUPERCOST"
    if (type !== movementType) {
      continue
    }

    totals[entry.ticketId] = (totals[entry.ticketId] ?? 0) + entry.amount
  }

  return totals
}

export async function aggregateCostsByItemType(): Promise<ItemTypeCostRow[]> {
  const [tickets, supercostEntries] = await Promise.all([
    fetchPublicTickets(),
    fetchAllSupercosts(),
  ])

  const supercosts = sumByTicket(supercostEntries, "SUPERCOST")
  const reopenCosts = sumByTicket(supercostEntries, "REOPEN")

  const totals = new Map<
    string,
    { supercost: number; reopenCost: number; glpiCost: number }
  >()

  for (const ticket of tickets) {
    const [costs, links] = await Promise.all([
      fetchPublicTicketCosts(ticket.id),
      listItemTicketsForTicket(ticket.id),
    ])

    if (links.length === 0) {
      continue
    }

    const glpiTotal = sumGlpiCosts(costs)
    const superTotal = supercosts[ticket.id] ?? 0
    const reopenTotal = reopenCosts[ticket.id] ?? 0
    const share = 1 / links.length

    for (const link of links) {
      const itemType = link.itemtype?.trim() || "Inconnu"
      const current = totals.get(itemType) ?? {
        supercost: 0,
        reopenCost: 0,
        glpiCost: 0,
      }

      current.glpiCost += glpiTotal * share
      current.supercost += superTotal * share
      current.reopenCost += reopenTotal * share
      totals.set(itemType, current)
    }
  }

  return [...totals.entries()]
    .map(([itemType, values]) => ({
      itemType,
      itemTypeLabel: formatItemTypeLabel(itemType),
      supercost: values.supercost,
      reopenCost: values.reopenCost,
      glpiCost: values.glpiCost,
      total: values.supercost + values.reopenCost + values.glpiCost,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.itemTypeLabel.localeCompare(b.itemTypeLabel, "fr"),
    )
}
