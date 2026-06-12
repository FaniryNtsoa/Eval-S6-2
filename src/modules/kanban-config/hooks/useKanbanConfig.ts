import { useCallback, useEffect, useState } from "react"

import { DEFAULT_KANBAN_CONFIG } from "@/modules/kanban-config/constants/defaults"
import {
  addKanbanLanguage,
  fetchKanbanConfig,
  removeKanbanLanguage,
  updateKanbanConfig,
} from "@/modules/kanban-config/services/kanbanConfigService"
import type {
  AddKanbanLanguageInput,
  KanbanConfig,
  UpdateKanbanConfigInput,
} from "@/modules/kanban-config/types/kanban-config.types"
import { getKanbanApiErrorMessage } from "@/modules/kanban-config/utils/errors"

interface UseKanbanConfigResult {
  config: KanbanConfig
  isLoading: boolean
  isSaving: boolean
  error: string | null
  reload: () => Promise<void>
  save: (input: UpdateKanbanConfigInput) => Promise<boolean>
  addLanguage: (input: AddKanbanLanguageInput) => Promise<boolean>
  removeLanguage: (code: string) => Promise<boolean>
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
        getKanbanApiErrorMessage(
          cause,
          "Impossible de charger la configuration Kanban",
        ),
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
        getKanbanApiErrorMessage(
          cause,
          "Impossible d'enregistrer la configuration Kanban",
        ),
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const addLanguage = useCallback(async (input: AddKanbanLanguageInput) => {
    setIsSaving(true)
    setError(null)

    try {
      const nextConfig = await addKanbanLanguage(input)
      setConfig(nextConfig)
      return true
    } catch (cause) {
      setError(
        getKanbanApiErrorMessage(cause, "Impossible d'ajouter la langue"),
      )
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const removeLanguage = useCallback(async (code: string) => {
    setIsSaving(true)
    setError(null)

    try {
      const nextConfig = await removeKanbanLanguage(code)
      setConfig(nextConfig)
      return true
    } catch (cause) {
      setError(
        getKanbanApiErrorMessage(cause, "Impossible de supprimer la langue"),
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
    addLanguage,
    removeLanguage,
  }
}
