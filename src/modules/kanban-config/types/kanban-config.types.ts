import type { KanbanStatusId } from "@/modules/assistance/constants/kanban"

export type KanbanLanguageCode = string

export interface KanbanLanguage {
  code: KanbanLanguageCode
  name: string
}

export interface KanbanColumnConfig {
  statusId: KanbanStatusId
  backgroundColor: string
  labels: Record<KanbanLanguageCode, string>
}

export interface KanbanConfig {
  languages: KanbanLanguage[]
  columns: KanbanColumnConfig[]
}

export interface UpdateKanbanColumnInput {
  statusId: KanbanStatusId
  backgroundColor: string
  labels: Record<KanbanLanguageCode, string>
}

export interface UpdateKanbanConfigInput {
  columns: UpdateKanbanColumnInput[]
}

export interface AddKanbanLanguageInput {
  code: string
  name: string
}

export interface TicketSupercost {
  id: number
  ticketId: number
  amount: number
  movementType?: "SUPERCOST" | "REOPEN"
  createdAt: string
}

export interface SaveTicketSupercostInput {
  ticketId: number
  amount: number
}

export interface SaveTicketReopenCostInput {
  ticketId: number
  percentage: number
}
