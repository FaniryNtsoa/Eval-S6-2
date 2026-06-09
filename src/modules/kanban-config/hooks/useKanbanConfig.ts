import { useCallback, useEffect, useState } from "react"

import { DEFAULT_KANBAN_CONFIG } from "@/modules/kanban-config/constants/defaults"
import {
  fetchKanbanConfig,
  updateKanbanConfig,
} from "@/modules/kanban-config/services/kanbanConfigService"
import type {
  KanbanConfig,
  UpdateKanbanConfigInput,
} from "@/modules/kanban-config/types/kanban-config.types"

interface UseKanbanConfigResult {
  config: KanbanConfig
  isLoading: boolean
  isSaving: boolean
  error: string | null
  reload: () => Promise<void>
  save: (input: UpdateKanbanConfigInput) => Promise<boolean>
}

export function useKanbanConfig(): UseKanbanConfigResult {
  const [config, setConfig] = useState<KanbanConfig>(DEFAULT_KANBAN_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextConfig = await fetchKanbanConfig()
      setConfig(nextConfig)
    } catch (cause) {
      setConfig(DEFAULT_KANBAN_CONFIG)
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossible de charger la configuration Kanban",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (input: UpdateKanbanConfigInput) => {
    setIsSaving(true)
    setError(null)

    try {
      const nextConfig = await updateKanbanConfig(input)
      setConfig(nextConfig)
      return true
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossible d'enregistrer la configuration Kanban",
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    config,
    isLoading,
    isSaving,
    error,
    reload,
    save,
  }
}
