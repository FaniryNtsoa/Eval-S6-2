import { parseAssetCsvFile } from "@/modules/import/asset/services/assetCsvParser"
import { importAssetCsvRows } from "@/modules/import/asset/services/assetImportService"
import { clearAssetNameCache } from "@/modules/import/common/services/assetNameResolver"
import { clearCurrentUserCache } from "@/modules/import/common/services/currentUserService"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import type {
  ImportProgress,
  ImportReport,
} from "@/modules/import/common/types/import-result.types"
import type {
  UnifiedImportFiles,
  UnifiedImportReport,
  UnifiedImportResult,
} from "@/modules/import/orchestrator/types/unified-import.types"
import { resetImportData } from "@/modules/import/reset/services/resetImportDataService"
import { parseTicketCostCsvFile } from "@/modules/import/ticket-cost/services/ticketCostCsvParser"
import { importTicketCostCsvRows } from "@/modules/import/ticket-cost/services/ticketCostImportService"
import { parseTicketCsvFile } from "@/modules/import/ticket/services/ticketCsvParser"
import { importTicketCsvRows } from "@/modules/import/ticket/services/ticketImportService"
import { clearLegacySession } from "@/services/api/legacyClient"
import { useAuthStore } from "@/services/stores/authStore"

type ProgressCallback = (progress: ImportProgress) => void

class ImportFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ImportFailedError"
  }
}

function emptyImportReport(): ImportReport {
  return {
    totalRows: 0,
    created: 0,
    updated: 0,
    errors: 0,
    rows: [],
  }
}

function assertNoRowErrors(report: { errors: number }, phaseLabel: string): void {
  if (report.errors > 0) {
    throw new ImportFailedError(
      `Échec phase ${phaseLabel} : ${report.errors} ligne(s) en erreur`,
    )
  }
}

async function runRollback(onProgress?: ProgressCallback): Promise<UnifiedImportReport["rollback"]> {
  onProgress?.({
    phase: "rollback",
    currentChunk: 0,
    totalChunks: 0,
    processedRows: 0,
    totalRows: 0,
    message: "Rollback en cours — réinitialisation des données GLPI…",
  })

  return resetImportData((resetProgress) => {
    onProgress?.({
      phase: "rollback",
      currentChunk: 0,
      totalChunks: 0,
      processedRows: resetProgress.processed,
      totalRows: resetProgress.total,
      message: resetProgress.message ?? "Rollback en cours…",
    })
  })
}

export async function runUnifiedImport(
  files: UnifiedImportFiles,
  onProgress?: ProgressCallback,
): Promise<UnifiedImportResult> {
  const sessionReady = await useAuthStore.getState().ensureSession()

  if (!sessionReady) {
    throw new Error("Session expirée. Reconnectez-vous avant d'importer.")
  }

  clearAssetNameCache()
  clearCurrentUserCache()
  clearLegacySession()

  const reports: UnifiedImportReport = {}
  let dataWritten = false

  try {
    onProgress?.({
      phase: "validating",
      currentChunk: 0,
      totalChunks: 0,
      processedRows: 0,
      totalRows: 0,
      message: "Validation des fichiers CSV…",
    })

    const [assetRows, ticketRows, costRows] = await Promise.all([
      parseAssetCsvFile(files.assets),
      parseTicketCsvFile(files.tickets),
      parseTicketCostCsvFile(files.costs),
    ])

    const totalRows = assetRows.length + ticketRows.length + costRows.length

    onProgress?.({
      phase: "importing",
      currentChunk: 0,
      totalChunks: 0,
      processedRows: 0,
      totalRows,
      message: "Import des actifs (1/3)…",
    })

    if (assetRows.length > 0) {
      dataWritten = true
      reports.assets = await importAssetCsvRows(assetRows, onProgress)
      assertNoRowErrors(reports.assets, "actifs")
    } else {
      reports.assets = emptyImportReport()
    }

    let ticketRefMap = new Map<string, number>()

    if (ticketRows.length > 0) {
      dataWritten = true
      onProgress?.({
        phase: "importing",
        currentChunk: 0,
        totalChunks: 0,
        processedRows: assetRows.length,
        totalRows,
        message: "Import des tickets (2/3)…",
      })

      const ticketResult = await importTicketCsvRows(ticketRows, onProgress)
      reports.tickets = ticketResult.report
      ticketRefMap = ticketResult.refMap
      assertNoRowErrors(reports.tickets, "tickets")
    } else {
      reports.tickets = emptyImportReport()
    }

    if (costRows.length > 0) {
      dataWritten = true
      onProgress?.({
        phase: "importing",
        currentChunk: 0,
        totalChunks: 0,
        processedRows: assetRows.length + ticketRows.length,
        totalRows,
        message: "Import des coûts tickets (3/3)…",
      })

      reports.costs = await importTicketCostCsvRows(
        costRows,
        ticketRefMap,
        onProgress,
      )
      assertNoRowErrors(reports.costs, "coûts")
    }

    onProgress?.({
      phase: "done",
      currentChunk: 0,
      totalChunks: 0,
      processedRows: totalRows,
      totalRows,
      message: "Import terminé avec succès",
    })

    return { success: true, reports }
  } catch (error) {
    const message = getErrorMessage(error)

    if (dataWritten) {
      try {
        reports.rollback = await runRollback(onProgress)
      } catch (rollbackError) {
        return {
          success: false,
          reports,
          error: `${message} · Rollback échoué : ${getErrorMessage(rollbackError)}`,
        }
      }

      onProgress?.({
        phase: "error",
        currentChunk: 0,
        totalChunks: 0,
        processedRows: 0,
        totalRows: 0,
        message: `Import échoué — rollback effectué : ${message}`,
      })

      return {
        success: false,
        reports,
        error: message,
      }
    }

    onProgress?.({
      phase: "error",
      currentChunk: 0,
      totalChunks: 0,
      processedRows: 0,
      totalRows: 0,
      message,
    })

    throw error
  }
}
