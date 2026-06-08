import {
  IMPORT_CHUNK_SIZE,
  IMPORT_CONCURRENCY,
} from "@/modules/import/common/constants"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import type {
  ImportProgress,
  ImportReport,
  ImportRowResult,
} from "@/modules/import/common/types/import-result.types"
import { chunkArray } from "@/modules/import/common/utils/chunk"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import { uploadAndLinkAssetImage } from "@/modules/import/asset-images/services/legacyDocumentService"
import type {
  AssetNameRefMap,
  ParsedAssetImage,
} from "@/modules/import/asset-images/types/asset-image.types"

type ProgressCallback = (progress: ImportProgress) => void

function assetNameKey(name: string): string {
  return name.trim().toLowerCase()
}

async function importImage(
  image: ParsedAssetImage,
  nameRefMap: AssetNameRefMap,
): Promise<ImportRowResult> {
  const assetRef = nameRefMap.get(assetNameKey(image.assetName))

  if (!assetRef) {
    return {
      rowIndex: image.rowIndex,
      status: "error",
      identifier: image.assetName,
      message: `Actif "${image.assetName}" introuvable après import`,
    }
  }

  try {
    const documentId = await uploadAndLinkAssetImage(
      image.blob,
      image.uploadFilename,
      image.documenttypesId,
      assetRef.itemType,
      assetRef.id,
    )

    return {
      rowIndex: image.rowIndex,
      status: "created",
      identifier: image.assetName,
      glpiId: documentId,
    }
  } catch (error) {
    return {
      rowIndex: image.rowIndex,
      status: "error",
      identifier: image.assetName,
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

export async function importAssetImages(
  images: ParsedAssetImage[],
  nameRefMap: AssetNameRefMap,
  onProgress?: ProgressCallback,
): Promise<ImportReport> {
  if (images.length === 0) {
    return {
      totalRows: 0,
      created: 0,
      updated: 0,
      errors: 0,
      rows: [],
    }
  }

  const chunks = chunkArray(images, IMPORT_CHUNK_SIZE)
  const allResults: ImportRowResult[] = []
  let processedRows = 0

  onProgress?.({
    phase: "importing",
    currentChunk: 0,
    totalChunks: chunks.length,
    processedRows: 0,
    totalRows: images.length,
    message: "Import des images actifs…",
  })

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex]

    const chunkResults = await runConcurrent(chunk, IMPORT_CONCURRENCY, (image) =>
      importImage(image, nameRefMap),
    )

    allResults.push(...chunkResults)
    processedRows += chunk.length

    onProgress?.({
      phase: "importing",
      currentChunk: chunkIndex + 1,
      totalChunks: chunks.length,
      processedRows,
      totalRows: images.length,
      message: `Images — lot ${chunkIndex + 1}/${chunks.length}`,
    })
  }

  const report = buildReport(allResults, images.length)

  onProgress?.({
    phase: "done",
    currentChunk: chunks.length,
    totalChunks: chunks.length,
    processedRows: images.length,
    totalRows: images.length,
    message: `Images terminées : ${report.created} importées, ${report.errors} erreurs`,
  })

  return report
}
