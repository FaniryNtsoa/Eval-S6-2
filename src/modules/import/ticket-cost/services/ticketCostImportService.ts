import {
  IMPORT_CHUNK_SIZE,
  IMPORT_CONCURRENCY,
} from "@/modules/import/common/constants"
import {
  createItem,
  deleteItem,
  getErrorMessage,
  listPaginated,
} from "@/modules/import/common/services/glpiResourceService"
import type {
  ImportProgress,
  ImportReport,
  ImportRowResult,
} from "@/modules/import/common/types/import-result.types"
import { chunkArray } from "@/modules/import/common/utils/chunk"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import type { TicketCostCsvRow } from "@/modules/import/ticket-cost/types/ticket-cost-csv.types"
import type { TicketRefMap } from "@/modules/import/ticket/types/ticket-csv.types"

interface TicketCostItem {
  id: number
}

type ProgressCallback = (progress: ImportProgress) => void

async function listTicketCosts(ticketId: number): Promise<TicketCostItem[]> {
  return listPaginated<TicketCostItem>(`${TICKET_ENDPOINT}/${ticketId}/Cost`)
}

async function replaceTicketCosts(
  ticketId: number,
  rows: TicketCostCsvRow[],
): Promise<void> {
  const existing = await listTicketCosts(ticketId)

  await Promise.all(
    existing.map((cost) =>
      deleteItem(`${TICKET_ENDPOINT}/${ticketId}/Cost`, cost.id),
    ),
  )

  for (const row of rows) {
    await createItem(`${TICKET_ENDPOINT}/${ticketId}/Cost`, {
      duration: row.durationSecond,
      cost_time: row.timeCost,
      cost_fixed: row.fixedCost,
    })
  }
}

function groupCostsByTicket(
  rows: TicketCostCsvRow[],
): Map<string, TicketCostCsvRow[]> {
  const grouped = new Map<string, TicketCostCsvRow[]>()

  for (const row of rows) {
    const existing = grouped.get(row.numTicket) ?? []
    existing.push(row)
    grouped.set(row.numTicket, existing)
  }

  return grouped
}

async function importCostGroup(
  numTicket: string,
  rows: TicketCostCsvRow[],
  refMap: TicketRefMap,
): Promise<ImportRowResult[]> {
  const ticketId = refMap.get(numTicket)

  if (!ticketId) {
    return rows.map((row) => ({
      rowIndex: row.rowIndex,
      status: "error" as const,
      identifier: numTicket,
      message: `Ticket "${numTicket}" introuvable après import`,
    }))
  }

  try {
    await replaceTicketCosts(ticketId, rows)

    return rows.map((row) => ({
      rowIndex: row.rowIndex,
      status: "created" as const,
      identifier: numTicket,
      glpiId: ticketId,
    }))
  } catch (error) {
    const message = getErrorMessage(error)

    return rows.map((row) => ({
      rowIndex: row.rowIndex,
      status: "error" as const,
      identifier: numTicket,
      message,
    }))
  }
}

function buildReport(rows: ImportRowResult[], totalRows: number): ImportReport {
  return {
    totalRows,
    created: rows.filter((row) => row.status === "created").length,
    updated: rows.filter((row) => row.status === "updated").length,
    errors: rows.filter((row) => row.status === "error").length,
    rows,
  }
}

export async function importTicketCostCsvRows(
  rows: TicketCostCsvRow[],
  refMap: TicketRefMap,
  onProgress?: ProgressCallback,
): Promise<ImportReport> {
  const grouped = groupCostsByTicket(rows)
  const groups = [...grouped.entries()]
  const chunks = chunkArray(groups, IMPORT_CHUNK_SIZE)
  const allResults: ImportRowResult[] = []
  let processedRows = 0

  onProgress?.({
    phase: "importing",
    currentChunk: 0,
    totalChunks: chunks.length,
    processedRows: 0,
    totalRows: rows.length,
    message: "Import des coûts tickets…",
  })

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex]

    const chunkResults = await runConcurrent(
      chunk,
      IMPORT_CONCURRENCY,
      ([numTicket, ticketRows]) =>
        importCostGroup(numTicket, ticketRows, refMap),
    )

    allResults.push(...chunkResults.flat())
    processedRows += chunk.reduce(
      (total, [, ticketRows]) => total + ticketRows.length,
      0,
    )

    onProgress?.({
      phase: "importing",
      currentChunk: chunkIndex + 1,
      totalChunks: chunks.length,
      processedRows,
      totalRows: rows.length,
      message: `Coûts — lot ${chunkIndex + 1}/${chunks.length}`,
    })
  }

  const report = buildReport(allResults, rows.length)

  onProgress?.({
    phase: "done",
    currentChunk: chunks.length,
    totalChunks: chunks.length,
    processedRows: rows.length,
    totalRows: rows.length,
    message: `Coûts terminés : ${report.created} créés, ${report.errors} erreurs`,
  })

  return report
}
