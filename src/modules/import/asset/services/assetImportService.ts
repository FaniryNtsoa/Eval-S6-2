import {
  IMPORT_CHUNK_SIZE,
  IMPORT_CONCURRENCY,
} from "@/modules/import/common/constants"
import {
  getAssetEntry,
  loadAssetRegistry,
} from "@/modules/import/common/services/glpiSchemaRegistry"
import {
  createItem,
  findOneByField,
  getErrorMessage,
  patchItem,
} from "@/modules/import/common/services/glpiResourceService"
import { ReferenceCache } from "@/modules/import/common/services/referenceCache"
import type {
  AssetRegistry,
  GlpiListItem,
} from "@/modules/import/common/types/glpi.types"
import type {
  ImportProgress,
  ImportReport,
  ImportRowResult,
} from "@/modules/import/common/types/import-result.types"
import { chunkArray } from "@/modules/import/common/utils/chunk"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import { buildAssetPayload } from "@/modules/import/asset/services/assetPayloadBuilder"
import { validateAllRowsAgainstSchema } from "@/modules/import/asset/services/assetRowValidator"
import { warmCachesForRows } from "@/modules/import/asset/services/assetWarmCache"
import type { AssetCsvRow } from "@/modules/import/asset/types/asset-csv.types"
import { useAuthStore } from "@/services/stores/authStore"

type ProgressCallback = (progress: ImportProgress) => void

async function findExistingAssetId(
  cache: ReferenceCache,
  itemType: string,
  assetEndpoint: string,
  inventoryNumber: string,
): Promise<number | null> {
  const cachedId = cache.getAssetId(itemType, inventoryNumber)
  if (cachedId !== undefined) {
    return cachedId
  }

  const existing = await findOneByField<GlpiListItem>(
    assetEndpoint,
    "otherserial",
    inventoryNumber,
    { activeOnly: true },
  )

  if (existing) {
    cache.setAsset(itemType, inventoryNumber, existing.id)
    return existing.id
  }

  return null
}

async function importRow(
  row: AssetCsvRow,
  registry: AssetRegistry,
  cache: ReferenceCache,
): Promise<ImportRowResult> {
  try {
    const entry = getAssetEntry(registry, row.itemType)

    if (!entry) {
      return {
        rowIndex: row.rowIndex,
        status: "error",
        identifier: row.inventoryNumber,
        message: `Type d'actif inconnu : ${row.itemType}`,
      }
    }

    const payload = await buildAssetPayload(row, entry, cache)
    const existingId = await findExistingAssetId(
      cache,
      row.itemType,
      entry.assetEndpoint,
      row.inventoryNumber,
    )

    if (existingId) {
      await patchItem(entry.assetEndpoint, existingId, payload)
      cache.setAsset(row.itemType, row.inventoryNumber, existingId)

      return {
        rowIndex: row.rowIndex,
        status: "updated",
        identifier: row.inventoryNumber,
        glpiId: existingId,
      }
    }

    const created = await createItem(entry.assetEndpoint, payload)
    cache.setAsset(row.itemType, row.inventoryNumber, created.id)

    return {
      rowIndex: row.rowIndex,
      status: "created",
      identifier: row.inventoryNumber,
      glpiId: created.id,
    }
  } catch (error) {
    return {
      rowIndex: row.rowIndex,
      status: "error",
      identifier: row.inventoryNumber,
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

export async function importAssetCsvRows(
  rows: AssetCsvRow[],
  onProgress?: ProgressCallback,
): Promise<ImportReport> {
  const sessionReady = await useAuthStore.getState().ensureSession()

  if (!sessionReady) {
    throw new Error("Session expirée. Reconnectez-vous avant d'importer.")
  }

  const cache = new ReferenceCache()
  const chunks = chunkArray(rows, IMPORT_CHUNK_SIZE)

  onProgress?.({
    phase: "loading-schema",
    currentChunk: 0,
    totalChunks: chunks.length,
    processedRows: 0,
    totalRows: rows.length,
    message: "Chargement des schémas GLPI…",
  })

  const registry = await loadAssetRegistry()
  validateAllRowsAgainstSchema(rows, registry)

  onProgress?.({
    phase: "warming-cache",
    currentChunk: 0,
    totalChunks: chunks.length,
    processedRows: 0,
    totalRows: rows.length,
    message: "Préchargement des références…",
  })

  await warmCachesForRows(rows, registry, cache)

  const allResults: ImportRowResult[] = []
  let processedRows = 0

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex]

    onProgress?.({
      phase: "importing",
      currentChunk: chunkIndex + 1,
      totalChunks: chunks.length,
      processedRows,
      totalRows: rows.length,
      message: `Import du lot ${chunkIndex + 1}/${chunks.length}…`,
    })

    const chunkResults = await runConcurrent(
      chunk,
      IMPORT_CONCURRENCY,
      (row) => importRow(row, registry, cache),
    )

    allResults.push(...chunkResults)
    processedRows += chunk.length

    onProgress?.({
      phase: "importing",
      currentChunk: chunkIndex + 1,
      totalChunks: chunks.length,
      processedRows,
      totalRows: rows.length,
      message: `Lot ${chunkIndex + 1}/${chunks.length} terminé`,
    })
  }

  const report = buildReport(allResults, rows.length)

  onProgress?.({
    phase: "done",
    currentChunk: chunks.length,
    totalChunks: chunks.length,
    processedRows: rows.length,
    totalRows: rows.length,
    message: `Import terminé : ${report.created} créés, ${report.updated} mis à jour, ${report.errors} erreurs`,
  })

  return report
}
