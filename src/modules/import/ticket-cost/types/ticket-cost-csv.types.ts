export interface TicketCostCsvRow {
  rowIndex: number
  numTicket: string
  durationSecond: number
  timeCost: number
  fixedCost: number
}

export interface TicketCostImportPayload {
  duration: number
  cost_time: number
  cost_fixed: number
}
