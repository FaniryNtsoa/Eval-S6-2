import Papa from "papaparse"

import { parseDecimal } from "@/modules/import/common/utils/parseDecimal"
import {
  CORE_TICKET_COST_CSV_COLUMNS,
  TICKET_COST_CSV_COLUMNS,
} from "@/modules/import/ticket-cost/constants/ticket-cost-csv-columns"
import type { TicketCostCsvRow } from "@/modules/import/ticket-cost/types/ticket-cost-csv.types"

function normalizeRow(
  raw: Record<string, string | undefined>,
  rowIndex: number,
): TicketCostCsvRow {
  return {
    rowIndex,
    numTicket: raw[TICKET_COST_CSV_COLUMNS.numTicket]?.trim() ?? "",
    durationSecond: parseDecimal(
      raw[TICKET_COST_CSV_COLUMNS.durationSecond] ?? "0",
      "Duration_second",
    ),
    timeCost: parseDecimal(
      raw[TICKET_COST_CSV_COLUMNS.timeCost] ?? "0",
      "Time_Cost",
    ),
    fixedCost: parseDecimal(
      raw[TICKET_COST_CSV_COLUMNS.fixedCost] ?? "0",
      "Fixed_Cost",
    ),
  }
}

function validateColumns(headers: string[]): void {
  const missing = CORE_TICKET_COST_CSV_COLUMNS.filter(
    (column) => !headers.includes(column),
  )

  if (missing.length > 0) {
    throw new Error(
      `Colonnes CSV coûts obligatoires manquantes : ${missing.join(", ")}`,
    )
  }
}

function validateCoreRow(row: TicketCostCsvRow): string | null {
  if (!row.numTicket) return "Num_Ticket est requis"
  return null
}

export function parseTicketCostCsv(content: string): TicketCostCsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0]
    throw new Error(
      `Erreur CSV coûts ligne ${firstError.row ?? "?"} : ${firstError.message}`,
    )
  }

  const headers = parsed.meta.fields ?? []

  if (headers.length === 0) {
    return []
  }

  validateColumns(headers)

  const rows: TicketCostCsvRow[] = []

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

export function parseTicketCostCsvFile(file: File): Promise<TicketCostCsvRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const content = String(reader.result ?? "")
        resolve(parseTicketCostCsv(content))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Impossible de lire le fichier CSV coûts"))
    }

    reader.readAsText(file)
  })
}

export function validateCostTicketReferences(
  costRows: TicketCostCsvRow[],
  ticketRefSet: Set<string>,
): void {
  for (const row of costRows) {
    if (!ticketRefSet.has(row.numTicket)) {
      throw new Error(
        `Ligne ${row.rowIndex} : Num_Ticket "${row.numTicket}" introuvable dans le fichier tickets`,
      )
    }
  }
}
