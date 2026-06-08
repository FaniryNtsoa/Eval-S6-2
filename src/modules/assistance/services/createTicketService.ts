import type {
  CreateTicketInput,
  CreateTicketResult,
} from "@/modules/assistance/types/ticket.types"
import { getPublicCurrentUserId } from "@/modules/import/common/services/currentUserService"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import { createItemTicket } from "@/modules/import/common/services/legacyItemTicketService"
import type { GlpiCreateResponse } from "@/modules/import/common/types/glpi.types"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import { publicGlpiClient } from "@/services/api/publicGlpiClient"

async function createTicketItem(payload: object): Promise<GlpiCreateResponse> {
  const { data } = await publicGlpiClient.post<GlpiCreateResponse>(
    TICKET_ENDPOINT,
    payload,
  )

  if (!data?.id) {
    const errorBody = data as { title?: string; detail?: string; status?: string }
    throw new Error(
      errorBody.detail ??
        errorBody.title ??
        errorBody.status ??
        "Réponse GLPI invalide lors de la création",
    )
  }

  return data
}

async function patchTicketItem(id: number, payload: object): Promise<void> {
  await publicGlpiClient.patch(`${TICKET_ENDPOINT}/${id}`, payload)
}

async function addRequester(ticketId: number, userId: number): Promise<void> {
  await publicGlpiClient.post(`${TICKET_ENDPOINT}/${ticketId}/TeamMember`, {
    type: "User",
    role: "requester",
    id: userId,
  })
}

function buildCreatePayload(input: CreateTicketInput) {
  const externalId = input.externalId?.trim()

  return {
    name: input.title.trim(),
    content: input.description.trim(),
    type: input.type,
    priority: input.priority,
    ...(externalId ? { external_id: externalId } : {}),
  }
}

export async function createTicket(
  input: CreateTicketInput,
): Promise<CreateTicketResult> {
  const warnings: string[] = []
  const created = await createTicketItem(buildCreatePayload(input))
  const ticketId = created.id

  try {
    const requesterId = await getPublicCurrentUserId()
    await addRequester(ticketId, requesterId)
  } catch (error) {
    warnings.push(`Demandeur non assigné : ${getErrorMessage(error)}`)
  }

  if (input.status && input.status !== 1) {
    try {
      await patchTicketItem(ticketId, { status: { id: input.status } })
    } catch (error) {
      warnings.push(`Statut non modifiable : ${getErrorMessage(error)}`)
    }
  }

  for (const element of input.elements) {
    try {
      await createItemTicket(ticketId, element.itemType, element.itemId)
    } catch (error) {
      warnings.push(
        `Élément ${element.itemType} #${element.itemId} non associé : ${getErrorMessage(error)}`,
      )
    }
  }

  return { ticketId, warnings }
}
