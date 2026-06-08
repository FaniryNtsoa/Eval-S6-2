import { useCallback, useState } from "react"

import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import type {
  ResetProgress,
  ResetReport,
} from "@/modules/import/common/types/import-result.types"
import { resetImportData } from "@/modules/import/reset/services/resetImportDataService"

const initialProgress: ResetProgress = {
  phase: "idle",
  processed: 0,
  total: 0,
}

export function useResetImportData() {
  const [progress, setProgress] = useState<ResetProgress>(initialProgress)
  const [report, setReport] = useState<ResetReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(initialProgress)
    setReport(null)
    setError(null)
  }, [])

  const runReset = useCallback(async () => {
    setIsRunning(true)
    setError(null)
    setReport(null)
    setProgress(initialProgress)

    try {
      const result = await resetImportData(setProgress)
      setReport(result)
      return result
    } catch (resetError) {
      const message = getErrorMessage(resetError)
      setError(message)
      setProgress((current) => ({
        ...current,
        phase: "error",
        message,
      }))
      throw resetError
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
    runReset,
  }
}
