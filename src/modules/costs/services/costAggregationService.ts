import { formatItemTypeLabel } from "@/modules/assistance/constants/ticket-labels"
import {
  fetchPublicTicketCosts,
  fetchPublicTickets,
} from "@/modules/assistance/services/publicTicketService"
import type { ItemTypeCostRow } from "@/modules/costs/types/cost-aggregation.types"
import { sumGlpiCosts } from "@/modules/assistance/utils/ticketCost"
import { fetchAllSupercosts } from "@/modules/kanban-config/services/kanbanConfigService"
import { listItemTicketsForTicket } from "@/modules/import/common/services/legacyItemTicketService"

export async function aggregateCostsByItemType(): Promise<ItemTypeCostRow[]> {
  const [tickets, supercostEntries] = await Promise.all([
    fetchPublicTickets(),
    fetchAllSupercosts(),
  ])

  const supercosts = Object.fromEntries(
    supercostEntries.map((entry) => [entry.ticketId, entry.amount]),
  ) as Record<number, number>

  const totals = new Map<string, { supercost: number; glpiCost: number }>()

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
    const share = 1 / links.length

    for (const link of links) {
      const itemType = link.itemtype?.trim() || "Inconnu"
      const current = totals.get(itemType) ?? { supercost: 0, glpiCost: 0 }

      current.glpiCost += glpiTotal * share
      current.supercost += superTotal * share
      totals.set(itemType, current)
    }
  }

  return [...totals.entries()]
    .map(([itemType, values]) => ({
      itemType,
      itemTypeLabel: formatItemTypeLabel(itemType),
      supercost: values.supercost,
      glpiCost: values.glpiCost,
      total: values.supercost + values.glpiCost,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.itemTypeLabel.localeCompare(b.itemTypeLabel, "fr"),
    )
}
