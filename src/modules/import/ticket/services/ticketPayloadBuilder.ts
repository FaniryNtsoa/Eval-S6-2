import { parseFrenchDateTime } from "@/modules/import/common/utils/parseDateTime"
import type { TicketCsvRow, TicketImportPayload } from "@/modules/import/ticket/types/ticket-csv.types"
import {
  mapTicketPriority,
  mapTicketType,
} from "@/modules/import/ticket/services/ticketStatusMapper"

export function buildTicketPayload(row: TicketCsvRow): TicketImportPayload {
  return {
    name: row.title,
    content: row.description,
    type: mapTicketType(row.type),
    priority: mapTicketPriority(row.priority),
    date: parseFrenchDateTime(row.date, row.time),
    external_id: row.refTicket,
  }
}
