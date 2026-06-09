import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"

export interface KanbanColumnConfig {
  statusId: KanbanStatusId
  labelFr: string
  labelMg: string
  backgroundColor: string
}

export interface KanbanConfig {
  columns: KanbanColumnConfig[]
}

export interface UpdateKanbanColumnInput {
  statusId: KanbanStatusId
  labelMg: string
  backgroundColor: string
}

export interface UpdateKanbanConfigInput {
  columns: UpdateKanbanColumnInput[]
}
