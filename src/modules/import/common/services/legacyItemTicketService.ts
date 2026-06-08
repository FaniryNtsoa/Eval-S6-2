import {
  legacyCreate,
  legacyDelete,
  legacyList,
} from "@/services/api/legacyClient"

interface LegacyItemTicket {
  id: number
  tickets_id?: number
  itemtype?: string
  items_id?: number
}

export async function listItemTicketsForTicket(
  ticketId: number,
): Promise<LegacyItemTicket[]> {
  return legacyList<LegacyItemTicket>(`/Ticket/${ticketId}/Item_Ticket/`)
}

export async function deleteItemTicket(linkId: number): Promise<void> {
  await legacyDelete("Item_Ticket", linkId)
}

export async function createItemTicket(
  ticketId: number,
  itemType: string,
  itemId: number,
): Promise<void> {
  await legacyCreate("Item_Ticket", {
    tickets_id: ticketId,
    itemtype: itemType,
    items_id: itemId,
  })
}

export async function syncTicketItems(
  ticketId: number,
  items: Array<{ itemType: string; itemId: number }>,
): Promise<void> {
  const existing = await listItemTicketsForTicket(ticketId)

  await Promise.all(existing.map((link) => deleteItemTicket(link.id)))

  for (const item of items) {
    await createItemTicket(ticketId, item.itemType, item.itemId)
  }
}
