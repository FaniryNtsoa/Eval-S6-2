import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import { DEFAULT_KANBAN_CONFIG } from "@/modules/kanban-config/constants/defaults"
import type {
  KanbanColumnConfig,
  KanbanConfig,
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
    if (column.statusId === 1 || column.statusId === 2 || column.statusId === 5) {
      map[column.statusId] = column
    }
  }

  return map
}
