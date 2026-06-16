import { useCallback, useState } from "react"

import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import type { ImportProgress, ImportReport } from "@/modules/import/common/types/import-result.types"
import {
  importMvtCsvRows,
  parseMvtCsvFile,
} from "@/modules/import/orchestrator/services/mvtImportService"
import type { MvtImportFiles } from "@/modules/import/orchestrator/types/mvt-import-types"

const initialProgress: ImportProgress = {
  phase: "idle",
  currentChunk: 0,
  totalChunks: 0,
  processedRows: 0,
  totalRows: 0,
}

export function useMvtImport() {
  const [progress, setProgress] = useState<ImportProgress>(initialProgress)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(initialProgress)
    setReport(null)
    setError(null)
  }, [])

  const runImport = useCallback(async (files: MvtImportFiles) => {
    setIsRunning(true)
    setError(null)
    setReport(null)
    setProgress(initialProgress)

    try {
      const rows = await parseMvtCsvFile(files.mvt)
      const { report: importReport } = await importMvtCsvRows(rows, setProgress)
      setReport(importReport)
      return importReport
    } catch (importError) {
      const message = getErrorMessage(importError)
      setError(message)
      setProgress((c) => ({ ...c, phase: "error", message }))
      throw importError
    } finally {
      setIsRunning(false)
    }
  }, [])

  return { progress, report, isRunning, error, reset, runImport }
}