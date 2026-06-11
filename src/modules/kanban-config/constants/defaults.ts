import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import type { KanbanConfig } from "@/modules/kanban-config/types/kanban-config.types"

export const KANBAN_STATUS_LABELS_FR: Record<KanbanStatusId, string> = {
  1: "Nouveau",
  2: "In progress",
  6: "Terminé",
}

export const DEFAULT_KANBAN_CONFIG: KanbanConfig = {
  columns: [
    {
      statusId: 1,
      labelFr: KANBAN_STATUS_LABELS_FR[1],
      labelMg: "Vaovao",
      backgroundColor: "#E0F2FE",
    },
    {
      statusId: 2,
      labelFr: KANBAN_STATUS_LABELS_FR[2],
      labelMg: "Efa manao",
      backgroundColor: "#EDE9FE",
    },
    {
      statusId: 6,
      labelFr: KANBAN_STATUS_LABELS_FR[6],
      labelMg: "Vita",
      backgroundColor: "#D1FAE5",
    },
  ],
}
