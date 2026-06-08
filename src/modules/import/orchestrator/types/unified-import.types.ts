import type { ImportReport } from "@/modules/import/common/types/import-result.types"
import type { ResetReport } from "@/modules/import/common/types/import-result.types"

export interface UnifiedImportFiles {
  assets: File
  images: File
  tickets: File
  costs: File
}

export interface UnifiedImportReport {
  assets?: ImportReport
  images?: ImportReport
  tickets?: ImportReport
  costs?: ImportReport
  rollback?: ResetReport
}

export interface UnifiedImportResult {
  success: boolean
  reports: UnifiedImportReport
  error?: string
}
