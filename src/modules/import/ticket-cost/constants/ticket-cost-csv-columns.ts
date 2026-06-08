export const TICKET_COST_CSV_COLUMNS = {
  numTicket: "Num_Ticket",
  durationSecond: "Duration_second",
  timeCost: "Time_Cost",
  fixedCost: "Fixed_Cost",
} as const

export const CORE_TICKET_COST_CSV_COLUMNS = [
  TICKET_COST_CSV_COLUMNS.numTicket,
  TICKET_COST_CSV_COLUMNS.durationSecond,
  TICKET_COST_CSV_COLUMNS.timeCost,
  TICKET_COST_CSV_COLUMNS.fixedCost,
] as const
