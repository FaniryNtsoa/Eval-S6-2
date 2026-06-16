export interface ItemTypeCostRow {
  itemType: string
  itemTypeLabel: string
  supercost: number
  reopenCost: number
  glpiCost: number
  total: number
  details : ItemTypeCostDetailLine[]
}
export type CostDetailSource = "supercost" | "reopen" | "glpi"

export interface ItemTypeCostDetailLine {
  ticketId: number
  ticketRef: string
  itemId: number
  itemRef: string
  source: CostDetailSource
  amount: number
}