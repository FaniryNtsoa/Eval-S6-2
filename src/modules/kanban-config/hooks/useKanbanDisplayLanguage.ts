import { useCallback, useEffect, useState } from "react"

import { KANBAN_FRENCH_LANGUAGE_CODE } from "@/modules/kanban-config/constants/defaults"
import type {
  KanbanLanguage,
  KanbanLanguageCode,
} from "@/modules/kanban-config/types/kanban-config.types"

const STORAGE_KEY = "kanban-display-language"

function readStoredLanguage(): KanbanLanguageCode | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredLanguage(code: KanbanLanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Ignore storage errors (private browsing, quota, etc.)
  }
}

export function useKanbanDisplayLanguage(languages: KanbanLanguage[]) {
  const [displayLanguage, setDisplayLanguageState] =
    useState<KanbanLanguageCode>(KANBAN_FRENCH_LANGUAGE_CODE)

  useEffect(() => {
    const stored = readStoredLanguage()
    const isValid =
      stored != null && languages.some((language) => language.code === stored)

    setDisplayLanguageState(
      isValid && stored ? stored : (languages[0]?.code ?? KANBAN_FRENCH_LANGUAGE_CODE),
    )
  }, [languages])

  const setDisplayLanguage = useCallback((code: KanbanLanguageCode) => {
    setDisplayLanguageState(code)
    writeStoredLanguage(code)
  }, [])

  return {
    displayLanguage,
    setDisplayLanguage,
  }
}
