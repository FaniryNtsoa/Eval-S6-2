export const KANBAN_STATUSES = [1, 2, 6] as const

export type KanbanStatusId = (typeof KANBAN_STATUSES)[number]

export function toKanbanColumn(statusId: number | undefined): KanbanStatusId {
  if (statusId === 1) {
    return 1
  }

  if (statusId === 5 || statusId === 6) {
    return 6
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

  if (toColumn === 6) {
    return "solution"
  }

  if (fromColumn === 6) {
    return "reopen"
  }

  return null
}
