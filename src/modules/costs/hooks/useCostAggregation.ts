import { useCallback, useEffect, useState } from "react"

import { aggregateCostsByItemType } from "@/modules/costs/services/costAggregationService"
import type { ItemTypeCostRow } from "@/modules/costs/types/cost-aggregation.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

export function useCostAggregation() {
  const [rows, setRows] = useState<ItemTypeCostRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await aggregateCostsByItemType()
      setRows(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { rows, isLoading, error, reload: load }
}
