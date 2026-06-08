import { useCallback, useState } from "react"

import { createTicket } from "@/modules/assistance/services/createTicketService"
import type {
  CreateTicketFormValues,
  CreateTicketResult,
  TicketLinkedElement,
} from "@/modules/assistance/types/ticket.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export function useCreateTicket() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateTicketResult | null>(null)

  const submit = useCallback(
    async (
      form: CreateTicketFormValues,
      elements: TicketLinkedElement[],
    ): Promise<CreateTicketResult | null> => {
      setIsSubmitting(true)
      setError(null)
      setResult(null)

      try {
        const created = await createTicket({
          title: form.title,
          description: form.description,
          type: form.type,
          priority: form.priority,
          status: form.status,
          externalId: form.externalId,
          elements,
        })

        setResult(created)
        return created
      } catch (submitError) {
        setError(getErrorMessage(submitError))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
  }, [])

  return {
    isSubmitting,
    error,
    result,
    submit,
    reset,
  }
}
