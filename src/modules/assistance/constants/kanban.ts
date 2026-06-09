export const KANBAN_STATUSES = [1, 2, 5] as const

export type KanbanStatusId = (typeof KANBAN_STATUSES)[number]

export const KANBAN_STATUS_LABELS: Record<KanbanStatusId, string> = {
  1: "Nouveau",
  2: "In progress",
  5: "Terminé",
}

export const KANBAN_COLUMN_STYLES: Record<
  KanbanStatusId,
  { header: string; body: string;dot: string }
> = {
  1: {
    header: "border-sky-200/80 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20",
    body:"border-sky-200/80 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20",
    dot: "bg-sky-500",
  },
  2: {
    header:"border-violet-200/80 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/20",
    body:"border-violet-200/80 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/20",
    dot: "bg-violet-500",
  },
  5: {
    header:"border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    body:"border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    dot: "bg-emerald-500",
  },
}

export function toKanbanColumn(statusId: number | undefined): KanbanStatusId {
  if (statusId === 1) {
    return 1
  }

  if (statusId === 5 || statusId === 6) {
    return 5
  }

  return 2
}

export type StatusChangeDialogKind = "solution" | "reopen"

export function getStatusChangeDialogKind(
  fromColumn: KanbanStatusId,
  toColumn: KanbanStatusId,
): StatusChangeDialogKind | null {
  if (fromColumn === toColumn) {
    return null
  }

  if (toColumn === 5) {
    return "solution"
  }

  if (fromColumn === 5) {
    return "reopen"
  }

  return null
}
