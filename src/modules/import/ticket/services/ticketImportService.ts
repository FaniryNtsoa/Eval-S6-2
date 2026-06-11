import {
  IMPORT_CHUNK_SIZE,
  IMPORT_CONCURRENCY,
} from "@/modules/import/common/constants"
import { resolveAssetByName } from "@/modules/import/common/services/assetNameResolver"
import { getCurrentUserId } from "@/modules/import/common/services/currentUserService"
import {
  createItem,
  findOneByField,
  getErrorMessage,
  patchItem,
} from "@/modules/import/common/services/glpiResourceService"
import { loadAssetRegistry } from "@/modules/import/common/services/glpiSchemaRegistry"
import { syncTicketItems } from "@/modules/import/common/services/legacyItemTicketService"
import type { AssetRegistry, GlpiListItem } from "@/modules/import/common/types/glpi.types"
import type {
  ImportProgress,
  ImportReport,
  ImportRowResult,
} from "@/modules/import/common/types/import-result.types"
import { chunkArray } from "@/modules/import/common/utils/chunk"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import { glpiClient } from "@/services/api/client"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import { buildTicketPayload } from "@/modules/import/ticket/services/ticketPayloadBuilder"
import {
  isDefaultTicketStatus,
  mapTicketStatus,
} from "@/modules/import/ticket/services/ticketStatusMapper"
import type {
  TicketCsvRow,
  TicketRefMap,
} from "@/modules/import/ticket/types/ticket-csv.types"

type ProgressCallback = (progress: ImportProgress) => void

async function findExistingTicketId(refTicket: string): Promise<number | null> {
  const existing = await findOneByField<GlpiListItem>(
    TICKET_ENDPOINT,
    "external_id",
    refTicket,
  )

  return existing?.id ?? null
}

async function addRequester(ticketId: number, userId: number): Promise<void> {
  await glpiClient.post(`${TICKET_ENDPOINT}/${ticketId}/TeamMember`, {
    type: "User",
    role: "requester",
    id: userId,
  })
}

async function applyTicketStatus(
  ticketId: number,
  statusLabel: string,
): Promise<string | undefined> {
  if (isDefaultTicketStatus(statusLabel)) {
    return undefined
  }

  const statusId = mapTicketStatus(statusLabel)

  try {
    await patchItem(TICKET_ENDPOINT, ticketId, { status: { id: statusId } })
    return undefined
  } catch (error) {
    return `Ticket importé mais statut non modifiable : ${getErrorMessage(error)}`
  }
}

async function linkTicketItems(
  row: TicketCsvRow,
  ticketId: number,
  registry: AssetRegistry,
): Promise<void> {
  const resolvedItems = await Promise.all(
    row.items.map((name) => resolveAssetByName(registry, name)),
  )

  await syncTicketItems(
    ticketId,
    resolvedItems.map((item) => ({
      itemType: item.itemType,
      itemId: item.id,
    })),
  )
}

async function importRow(
  row: TicketCsvRow,
  registry: AssetRegistry,
  requesterId: number,
  refMap: TicketRefMap,
): Promise<ImportRowResult> {
  try {
    const payload = buildTicketPayload(row)
    const existingId = await findExistingTicketId(row.refTicket)
    let ticketId: number
    let status: ImportRowResult["status"]
    const warnings: string[] = []

    if (existingId) {
      await patchItem(TICKET_ENDPOINT, existingId, payload)
      ticketId = existingId
      status = "updated"
    } else {
      const created = await createItem(TICKET_ENDPOINT, payload)
      ticketId = created.id
      status = "created"

      try {
        await addRequester(ticketId, requesterId)
      } catch (error) {
        warnings.push(
          `Demandeur non assigné : ${getErrorMessage(error)}`,
        )
      }
    }


    await linkTicketItems(row, ticketId, registry)

    const statusWarning = await applyTicketStatus(ticketId, row.status)
    if (statusWarning) {
      warnings.push(statusWarning)
    }

    refMap.set(row.refTicket, ticketId)

    return {
      rowIndex: row.rowIndex,
      status,
      identifier: row.refTicket,
      glpiId: ticketId,
      message: warnings.length > 0 ? warnings.join(" · ") : undefined,
    }
  } catch (error) {
    return {
      rowIndex: row.rowIndex,
      status: "error",
      identifier: row.refTicket,
      message: getErrorMessage(error),
    }
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

export async function importTicketCsvRows(
  rows: TicketCsvRow[],
  onProgress?: ProgressCallback,
): Promise<{ report: ImportReport; refMap: TicketRefMap }> {
  const registry = await loadAssetRegistry()
  const requesterId = await getCurrentUserId()
  const refMap: TicketRefMap = new Map()
  const chunks = chunkArray(rows, IMPORT_CHUNK_SIZE)
  const allResults: ImportRowResult[] = []
  let processedRows = 0

  onProgress?.({
    phase: "importing",
    currentChunk: 0,
    totalChunks: chunks.length,
    processedRows: 0,
    totalRows: rows.length,
    message: "Import des tickets…",
  })

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex]

    const chunkResults = await runConcurrent(
      chunk,
      IMPORT_CONCURRENCY,
      (row) => importRow(row, registry, requesterId, refMap),
    )

    allResults.push(...chunkResults)
    processedRows += chunk.length

    onProgress?.({
      phase: "importing",
      currentChunk: chunkIndex + 1,
      totalChunks: chunks.length,
      processedRows,
      totalRows: rows.length,
      message: `Tickets — lot ${chunkIndex + 1}/${chunks.length}`,
    })
  }

  const report = buildReport(allResults, rows.length)

  onProgress?.({
    phase: "done",
    currentChunk: chunks.length,
    totalChunks: chunks.length,
    processedRows: rows.length,
    totalRows: rows.length,
    message: `Tickets terminés : ${report.created} créés, ${report.updated} mis à jour, ${report.errors} erreurs`,
  })

  return { report, refMap }
}
