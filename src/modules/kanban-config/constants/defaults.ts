import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"
import type { KanbanConfig } from "@/modules/kanban-config/types/kanban-config.types"

export const KANBAN_FRENCH_LANGUAGE_CODE = "fr"
export const KANBAN_MALAGASY_LANGUAGE_CODE = "mg"

export const KANBAN_PROTECTED_LANGUAGE_CODES = new Set([
  KANBAN_FRENCH_LANGUAGE_CODE,
  KANBAN_MALAGASY_LANGUAGE_CODE,
])

export const KANBAN_STATUS_LABELS_FR: Record<KanbanStatusId, string> = {
  1: "Nouveau",
  2: "In progress",
  6: "Terminé",
}

export const DEFAULT_KANBAN_CONFIG: KanbanConfig = {
  languages: [
    { code: KANBAN_FRENCH_LANGUAGE_CODE, name: "Français" },
    { code: KANBAN_MALAGASY_LANGUAGE_CODE, name: "Malgache" },
  ],
  columns: [
    {
      statusId: 1,
      backgroundColor: "#E0F2FE",
      labels: {
        fr: KANBAN_STATUS_LABELS_FR[1],
        mg: "Vaovao",
      },
    },
    {
      statusId: 2,
      backgroundColor: "#EDE9FE",
      labels: {
        fr: KANBAN_STATUS_LABELS_FR[2],
        mg: "Efa manao",
      },
    },
    {
      statusId: 6,
      backgroundColor: "#D1FAE5",
      labels: {
        fr: KANBAN_STATUS_LABELS_FR[6],
        mg: "Vita",
      },
    },
  ],
}
