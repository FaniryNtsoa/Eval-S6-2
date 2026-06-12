import { GLPI_PAGE_SIZE } from "@/modules/import/common/constants"
import { ACTIVE_ONLY_FILTER } from "@/modules/import/common/services/glpiResourceService"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import type { GlpiTicketCost } from "@/modules/assistance/types/ticket-cost.types"
import type {
  GlpiTicketDetail,
  GlpiTicketListItem,
} from "@/modules/assistance/types/ticket.types"
import { publicGlpiClient } from "@/services/api/publicGlpiClient"

async function listPublicPaginated<T extends { id: number }>(
  endpoint: string,
  options?: { filter?: string },
): Promise<T[]> {
  const items: T[] = []
  let start = 0

  while (true) {
    const { data } = await publicGlpiClient.get<T[]>(endpoint, {
      params: {
        start,
        limit: GLPI_PAGE_SIZE,
        ...(options?.filter ? { filter: options.filter } : {}),
      },
    })

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    items.push(...data)

    if (data.length < GLPI_PAGE_SIZE) {
      break
    }

    start += GLPI_PAGE_SIZE
  }

  return items
}

export async function fetchPublicTickets(): Promise<GlpiTicketListItem[]> {
  const items = await listPublicPaginated<GlpiTicketListItem>(TICKET_ENDPOINT, {
    filter: ACTIVE_ONLY_FILTER,
  })

  return items.sort((a, b) => b.id - a.id)
}

export async function fetchPublicTicketById(
  id: number,
): Promise<GlpiTicketDetail> {
  const { data } = await publicGlpiClient.get<GlpiTicketDetail>(
    `${TICKET_ENDPOINT}/${id}`,
  )

  return data
}

export async function fetchPublicTicketCosts(
  ticketId: number,
): Promise<GlpiTicketCost[]> {
  return listPublicPaginated<GlpiTicketCost>(
    `${TICKET_ENDPOINT}/${ticketId}/Cost`,
  )
}

export interface UpdatePublicTicketStatusInput {
  ticketId: number
  statusId: number
  comment?: string
}

async function addTicketSolution(
  ticketId: number,
  content: string,
): Promise<void> {
  await publicGlpiClient.post(
    `${TICKET_ENDPOINT}/${ticketId}/Timeline/Solution`,
    { content },
  )
}

async function addTicketFollowup(
  ticketId: number,
  content: string,
): Promise<void> {
  await publicGlpiClient.post(
    `${TICKET_ENDPOINT}/${ticketId}/Timeline/Followup`,
    { content, is_private: false },
  )
}

export async function updatePublicTicketStatus({
  ticketId,
  statusId,
  comment,
}: UpdatePublicTicketStatusInput): Promise<void> {
  const trimmedComment = comment?.trim()

  if (trimmedComment) {
    if (statusId === 6) {
      await addTicketSolution(ticketId, trimmedComment)
    } else {
      await addTicketFollowup(ticketId, trimmedComment)
    }
  }

  await publicGlpiClient.patch(`${TICKET_ENDPOINT}/${ticketId}`, {
    status: { id: statusId },
  })
}
