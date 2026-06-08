import { useCallback, useEffect, useState } from "react"

import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import { fetchDashboardStats } from "@/modules/dashboard/services/dashboardStatsService"
import type { DashboardStats } from "@/modules/dashboard/types/dashboard.types"

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchDashboardStats()
      setStats(result)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { stats, isLoading, error, refresh: load }
}
