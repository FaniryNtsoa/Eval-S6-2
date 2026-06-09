export const KANBAN_STATUSES = [1, 2, 5] as const

export type KanbanStatusId = (typeof KANBAN_STATUSES)[number]

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
