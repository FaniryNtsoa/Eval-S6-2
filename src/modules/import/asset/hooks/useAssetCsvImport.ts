import { useCallback, useState } from "react"

import { parseAssetCsvFile } from "@/modules/import/asset/services/assetCsvParser"
import { importAssetCsvRows } from "@/modules/import/asset/services/assetImportService"
import type { ImportProgress, ImportReport } from "@/modules/import/common/types/import-result.types"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

const initialProgress: ImportProgress = {
  phase: "idle",
  currentChunk: 0,
  totalChunks: 0,
  processedRows: 0,
  totalRows: 0,
}

export function useAssetCsvImport() {
  const [progress, setProgress] = useState<ImportProgress>(initialProgress)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(initialProgress)
    setReport(null)
    setError(null)
  }, [])

  const runImport = useCallback(async (file: File) => {
    setIsRunning(true)
    setError(null)
    setReport(null)
    setProgress(initialProgress)

    try {
      const rows = await parseAssetCsvFile(file)
      const { report: importReport } = await importAssetCsvRows(rows, setProgress)
      setReport(importReport)
      return importReport
    } catch (importError) {
      const message = getErrorMessage(importError)
      setError(message)
      setProgress((current) => ({
        ...current,
        phase: "error",
        message,
      }))
      throw importError
    } finally {
      setIsRunning(false)
    }
  }, [])

  return {
    progress,
    report,
    isRunning,
    error,
    reset,
    runImport,
  }
}
