export interface TicketCsvRow {
  rowIndex: number
  refTicket: string
  date: string
  time: string
  type: string
  title: string
  description: string
  status: string
  priority: string
  items: string[]
}

export interface TicketImportPayload {
  name: string
  content: string
  type: number
  priority: number
  date: string
  external_id: string
}

export type TicketRefMap = Map<string, number>
