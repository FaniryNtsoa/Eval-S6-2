import type { ImportReport } from "@/modules/import/common/types/import-result.types"
import type { ResetReport } from "@/modules/import/common/types/import-result.types"

export interface UnifiedImportFiles {
  assets: File
  tickets: File
  costs: File
}

export interface UnifiedImportReport {
  assets?: ImportReport
  tickets?: ImportReport
  costs?: ImportReport
  rollback?: ResetReport
}

export interface UnifiedImportResult {
  success: boolean
  reports: UnifiedImportReport
  error?: string
}
