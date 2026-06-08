export const TICKET_CSV_COLUMNS = {
  refTicket: "Ref_Ticket",
  date: "Date",
  time: "Heure",
  type: "Type",
  title: "Titre",
  description: "Description",
  status: "Status",
  priority: "Priority",
  items: "Items",
} as const

export const CORE_TICKET_CSV_COLUMNS = [
  TICKET_CSV_COLUMNS.refTicket,
  TICKET_CSV_COLUMNS.date,
  TICKET_CSV_COLUMNS.time,
  TICKET_CSV_COLUMNS.type,
  TICKET_CSV_COLUMNS.title,
  TICKET_CSV_COLUMNS.description,
  TICKET_CSV_COLUMNS.status,
  TICKET_CSV_COLUMNS.priority,
] as const

export const TICKET_ENDPOINT = "/Assistance/Ticket"
