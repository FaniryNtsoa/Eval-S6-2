import { glpiClient } from "@/services/api/client"
import {
  ACTIVE_ONLY_FILTER,
  listPaginated,
} from "@/modules/import/common/services/glpiResourceService"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import type {
  GlpiTicketDetail,
  GlpiTicketListItem,
} from "@/modules/assistance/types/ticket.types"

export async function fetchTickets(): Promise<GlpiTicketListItem[]> {
  const items = await listPaginated<GlpiTicketListItem>(TICKET_ENDPOINT, {
    filter: ACTIVE_ONLY_FILTER,
  })

  return items.sort((a, b) => b.id - a.id)
}

export async function fetchTicketById(id: number): Promise<GlpiTicketDetail> {
  const { data } = await glpiClient.get<GlpiTicketDetail>(
    `${TICKET_ENDPOINT}/${id}`,
  )

  return data
}
