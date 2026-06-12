import { useCallback, useEffect, useState } from "react"

import {
  fetchTicketById,
  fetchTicketCosts,
  fetchTickets,
} from "@/modules/assistance/services/ticketService"
import type { GlpiTicketCost } from "@/modules/assistance/types/ticket-cost.types"
import type {
  GlpiTicketDetail,
  GlpiTicketListItem,
} from "@/modules/assistance/types/ticket.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export function useTickets() {
  const [tickets, setTickets] = useState<GlpiTicketListItem[]>([])
  const [selectedTicket, setSelectedTicket] = useState<GlpiTicketDetail | null>(
    null,
  )
  const [selectedCosts, setSelectedCosts] = useState<GlpiTicketCost[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    setIsLoadingList(true)
    setError(null)

    try {
      const items = await fetchTickets()
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
        fetchTicketById(id),
        fetchTicketCosts(id),
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
    error,
    loadTickets,
    selectTicket,
    clearSelection,
  }
}
