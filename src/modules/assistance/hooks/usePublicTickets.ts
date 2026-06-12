import { useCallback, useEffect, useState } from "react"

import {
  fetchPublicTicketById,
  fetchPublicTicketCosts,
  fetchPublicTickets,
  updatePublicTicketStatus,
  type UpdatePublicTicketStatusInput,
} from "@/modules/assistance/services/publicTicketService"
import type { GlpiTicketCost } from "@/modules/assistance/types/ticket-cost.types"
import type {
  GlpiTicketDetail,
  GlpiTicketListItem,
} from "@/modules/assistance/types/ticket.types"
import { saveSupercost } from "@/modules/kanban-config/services/kanbanConfigService"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export interface ChangeTicketStatusInput extends UpdatePublicTicketStatusInput {
  supercost?: number
}

export function usePublicTickets() {
  const [tickets, setTickets] = useState<GlpiTicketListItem[]>([])
  const [selectedTicket, setSelectedTicket] = useState<GlpiTicketDetail | null>(
    null,
  )
  const [selectedCosts, setSelectedCosts] = useState<GlpiTicketCost[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    setIsLoadingList(true)
    setError(null)

    try {
      const items = await fetchPublicTickets()
      setTickets(items)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  const selectTicket = useCallback(async (id: number) => {
    setSelectedId(id)
    setIsLoadingDetail(true)
    setError(null)

    try {
      const [detail, costs] = await Promise.all([
        fetchPublicTicketById(id),
        fetchPublicTicketCosts(id),
      ])
      setSelectedTicket(detail)
      setSelectedCosts(costs)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
      setSelectedTicket(null)
      setSelectedCosts([])
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
    setSelectedTicket(null)
    setSelectedCosts([])
  }, [])

  const changeTicketStatus = useCallback(
    async (input: ChangeTicketStatusInput) => {
      setIsUpdatingStatus(true)
      setError(null)

      const previousTickets = tickets

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === input.ticketId
            ? { ...ticket, status: { id: input.statusId } }
            : ticket,
        ),
      )

      try {
        await updatePublicTicketStatus(input)

        if (
          input.statusId === 6 &&
          input.supercost != null &&
          input.supercost > 0
        ) {
          await saveSupercost({
            ticketId: input.ticketId,
            amount: input.supercost,
          })
        }

        if (selectedId === input.ticketId) {
          const [detail, costs] = await Promise.all([
            fetchPublicTicketById(input.ticketId),
            fetchPublicTicketCosts(input.ticketId),
          ])
          setSelectedTicket(detail)
          setSelectedCosts(costs)
        }
      } catch (updateError) {
        setTickets(previousTickets)
        const message = getErrorMessage(updateError)
        setError(message)
        throw new Error(message)
      } finally {
        setIsUpdatingStatus(false)
      }
    },
    [selectedId, tickets],
  )

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  return {
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
  }
}
