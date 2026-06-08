import Papa from "papaparse"

import {
  CORE_TICKET_CSV_COLUMNS,
  TICKET_CSV_COLUMNS,
} from "@/modules/import/ticket/constants/ticket-csv-columns"
import type { TicketCsvRow } from "@/modules/import/ticket/types/ticket-csv.types"
import { parseJsonStringArray } from "@/modules/import/common/utils/parseJsonArray"

function normalizeRow(
  raw: Record<string, string | undefined>,
  rowIndex: number,
): TicketCsvRow {
  return {
    rowIndex,
    refTicket: raw[TICKET_CSV_COLUMNS.refTicket]?.trim() ?? "",
    date: raw[TICKET_CSV_COLUMNS.date]?.trim() ?? "",
    time: raw[TICKET_CSV_COLUMNS.time]?.trim() ?? "",
    type: raw[TICKET_CSV_COLUMNS.type]?.trim() ?? "",
    title: raw[TICKET_CSV_COLUMNS.title]?.trim() ?? "",
    description: raw[TICKET_CSV_COLUMNS.description]?.trim() ?? "",
    status: raw[TICKET_CSV_COLUMNS.status]?.trim() ?? "",
    priority: raw[TICKET_CSV_COLUMNS.priority]?.trim() ?? "",
    items: parseJsonStringArray(raw[TICKET_CSV_COLUMNS.items] ?? "", "Items"),
  }
}

function validateColumns(headers: string[]): void {
  const missing = CORE_TICKET_CSV_COLUMNS.filter(
    (column) => !headers.includes(column),
  )

  if (missing.length > 0) {
    throw new Error(
      `Colonnes CSV tickets obligatoires manquantes : ${missing.join(", ")}`,
    )
  }
}

function validateCoreRow(row: TicketCsvRow): string | null {
  if (!row.refTicket) return "Ref_Ticket est requis"
  if (!row.date) return "Date est requise"
  if (!row.time) return "Heure est requise"
  if (!row.type) return "Type est requis"
  if (!row.title) return "Titre est requis"
  if (!row.priority) return "Priority est requise"
  return null
}

export function parseTicketCsv(content: string): TicketCsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0]
    throw new Error(
      `Erreur CSV tickets ligne ${firstError.row ?? "?"} : ${firstError.message}`,
    )
  }

  const headers = parsed.meta.fields ?? []

  if (headers.length === 0) {
    return []
  }

  validateColumns(headers)

  const rows: TicketCsvRow[] = []

  parsed.data.forEach((raw, index) => {
    const row = normalizeRow(raw, index + 2)
    const error = validateCoreRow(row)

    if (error) {
      throw new Error(`Ligne ${row.rowIndex} : ${error}`)
    }

    rows.push(row)
  })

  return rows
}

export function parseTicketCsvFile(file: File): Promise<TicketCsvRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const content = String(reader.result ?? "")
        resolve(parseTicketCsv(content))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Impossible de lire le fichier CSV tickets"))
    }

    reader.readAsText(file)
  })
}
