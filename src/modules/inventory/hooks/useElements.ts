import { useCallback, useEffect, useState } from "react"

import { fetchElements } from "@/modules/inventory/services/elementService"
import type { ElementListItem } from "@/modules/inventory/types/element.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export function useElements() {
  const [elements, setElements] = useState<ElementListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadElements = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await fetchElements()
      setElements(items)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadElements()
  }, [loadElements])

  return {
    elements,
    isLoading,
    error,
    loadElements,
  }
}
