import { formatItemTypeLabel } from "@/modules/assistance/constants/ticket-labels"
import {
  fetchPublicTicketCosts,
  fetchPublicTickets,
} from "@/modules/assistance/services/publicTicketService"
import type { ItemTypeCostRow } from "@/modules/costs/types/cost-aggregation.types"
import { sumGlpiCosts } from "@/modules/assistance/utils/ticketCost"
import { fetchAllSupercosts } from "@/modules/kanban-config/services/kanbanConfigService"
import { listItemTicketsForTicket } from "@/modules/import/common/services/legacyItemTicketService"
import type { ItemTypeCostDetailLine } from "@/modules/costs/types/cost-aggregation.types"
import { fetchElements } from "@/modules/inventory/services/elementService"
function sumByTicket(
  entries: { ticketId: number; amount: number; movementType?: string }[],
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
  const elements = await fetchElements()
  const itemRefByKey = new Map(
    elements.map((el) => [
      `${el.itemType}:${el.id}`,
       el.name?.trim() || el.inventoryNumber?.trim() || `#${el.id}`,
    ]),
  )

  const supercosts = sumByTicket(supercostEntries, "SUPERCOST")
  const reopenCosts = sumByTicket(supercostEntries, "REOPEN")

  const totals = new Map<
    string,
    { supercost: number; reopenCost: number; glpiCost: number; details: ItemTypeCostDetailLine[] }
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
    const ticketRef = ticket.external_id?.trim() || String(ticket.id)
    for (const link of links) {
      const itemType = link.itemtype?.trim() || "Inconnu"
      const itemId = link.items_id ?? 0
      const itemRef =
        itemRefByKey.get(`${itemType}:${itemId}`) ?? `#${itemId}`
      const current = totals.get(itemType) ?? {
        supercost: 0,
        reopenCost: 0,
        glpiCost: 0,
        details: [],
      }
      const pushDetail = (
        source: ItemTypeCostDetailLine["source"],
        ticketTotal: number,
      ) => {
        const amount = ticketTotal * share
        if (amount <= 0) return
        current.details.push({
          ticketId: ticket.id,
          ticketRef,
          itemId,
          itemRef,
          source,
          amount,
        })
      }
      pushDetail("glpi", glpiTotal)
      pushDetail("supercost", superTotal)
      pushDetail("reopen", reopenTotal)

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
      details: values.details,
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.itemTypeLabel.localeCompare(b.itemTypeLabel, "fr"),
    )
}
