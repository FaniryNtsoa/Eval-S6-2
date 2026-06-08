import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { CreateTicketFormModal } from "@/shared/components/layout/CreateTicketFormModal"

interface CreateTicketSuccess {
  ticketId: number
  warnings: string[]
}

interface CreateTicketModalContextValue {
  openCreateTicket: () => void
  lastSuccess: CreateTicketSuccess | null
  clearSuccess: () => void
}

const CreateTicketModalContext =
  createContext<CreateTicketModalContextValue | null>(null)

export function CreateTicketModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [lastSuccess, setLastSuccess] = useState<CreateTicketSuccess | null>(
    null,
  )

  const openCreateTicket = useCallback(() => {
    setOpen(true)
  }, [])

  const clearSuccess = useCallback(() => {
    setLastSuccess(null)
  }, [])

  const handleSuccess = useCallback((result: CreateTicketSuccess) => {
    setLastSuccess(result)

    if (result.warnings.length === 0) {
      setOpen(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      openCreateTicket,
      lastSuccess,
      clearSuccess,
    }),
    [clearSuccess, lastSuccess, openCreateTicket],
  )

  return (
    <CreateTicketModalContext.Provider value={value}>
      {children}
      <CreateTicketFormModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </CreateTicketModalContext.Provider>
  )
}

export function useCreateTicketModal() {
  const context = useContext(CreateTicketModalContext)

  if (!context) {
    throw new Error(
      "useCreateTicketModal doit être utilisé dans CreateTicketModalProvider",
    )
  }

  return context
}
