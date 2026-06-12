import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import {
  DEFAULT_KANBAN_CONFIG,
  KANBAN_FRENCH_LANGUAGE_CODE,
  KANBAN_STATUS_LABELS_FR,
} from "@/modules/kanban-config/constants/defaults"
import type {
  KanbanColumnConfig,
  KanbanConfig,
  KanbanLanguageCode,
} from "@/modules/kanban-config/types/kanban-config.types"

const DEFAULT_COLUMN_MAP = Object.fromEntries(
  DEFAULT_KANBAN_CONFIG.columns.map((column) => [column.statusId, column]),
) as Record<KanbanStatusId, KanbanColumnConfig>

export function buildColumnConfigMap(
  config: KanbanConfig,
): Record<KanbanStatusId, KanbanColumnConfig> {
  const map: Record<KanbanStatusId, KanbanColumnConfig> = {
    ...DEFAULT_COLUMN_MAP,
  }

  for (const column of config.columns) {
    if (column.statusId === 1 || column.statusId === 2 || column.statusId === 6) {
      map[column.statusId] = column
    }
  }

  return map
}

export function resolveColumnLabel(
  column: KanbanColumnConfig,
  languageCode: KanbanLanguageCode,
): string {
  const label = column.labels[languageCode]?.trim()

  if (label) {
    return label
  }

  if (languageCode !== KANBAN_FRENCH_LANGUAGE_CODE) {
    const frenchFallback = column.labels[KANBAN_FRENCH_LANGUAGE_CODE]?.trim()
    if (frenchFallback) {
      return frenchFallback
    }
  }

  return KANBAN_STATUS_LABELS_FR[column.statusId]
}
