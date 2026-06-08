import { useCallback, useState } from "react"

import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import type { ImportProgress } from "@/modules/import/common/types/import-result.types"
import { runUnifiedImport } from "@/modules/import/orchestrator/services/unifiedImportService"
import type {
  UnifiedImportFiles,
  UnifiedImportResult,
} from "@/modules/import/orchestrator/types/unified-import.types"

const initialProgress: ImportProgress = {
  phase: "idle",
  currentChunk: 0,
  totalChunks: 0,
  processedRows: 0,
  totalRows: 0,
}

export function useUnifiedImport() {
  const [progress, setProgress] = useState<ImportProgress>(initialProgress)
  const [result, setResult] = useState<UnifiedImportResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(initialProgress)
    setResult(null)
    setError(null)
  }, [])

  const runImport = useCallback(async (files: UnifiedImportFiles) => {
    setIsRunning(true)
    setError(null)
    setResult(null)
    setProgress(initialProgress)

    try {
      const importResult = await runUnifiedImport(files, setProgress)
      setResult(importResult)

      if (!importResult.success) {
        setError(importResult.error ?? "Import échoué")
      }

      return importResult
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
    result,
    isRunning,
    error,
    reset,
    runImport,
  }
}
