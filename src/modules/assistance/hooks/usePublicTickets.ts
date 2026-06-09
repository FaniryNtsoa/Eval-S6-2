import { useCallback, useEffect, useState } from "react"

import {
  fetchPublicTicketById,
  fetchPublicTickets,
  updatePublicTicketStatus,
  type UpdatePublicTicketStatusInput,
} from "@/modules/assistance/services/publicTicketService"
import type {
  GlpiTicketDetail,
  GlpiTicketListItem,
} from "@/modules/assistance/types/ticket.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export function usePublicTickets() {
  const [tickets, setTickets] = useState<GlpiTicketListItem[]>([])
  const [selectedTicket, setSelectedTicket] = useState<GlpiTicketDetail | null>(
    null,
  )
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
      const detail = await fetchPublicTicketById(id)
      setSelectedTicket(detail)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
      setSelectedTicket(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
    setSelectedTicket(null)
  }, [])

  const changeTicketStatus = useCallback(
    async (input: UpdatePublicTicketStatusInput) => {
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

        if (selectedId === input.ticketId) {
          const detail = await fetchPublicTicketById(input.ticketId)
          setSelectedTicket(detail)
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
