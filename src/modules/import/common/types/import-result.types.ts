export type ImportRowStatus = "created" | "updated" | "error"

export interface ImportRowResult {
  rowIndex: number
  status: ImportRowStatus
  identifier: string
  message?: string
  glpiId?: number
}

export interface ImportChunkResult {
  chunkIndex: number
  results: ImportRowResult[]
}

export interface ImportReport {
  totalRows: number
  created: number
  updated: number
  errors: number
  rows: ImportRowResult[]
}

export interface ImportProgress {
  phase:
    | "idle"
    | "validating"
    | "loading-schema"
    | "warming-cache"
    | "importing"
    | "rollback"
    | "done"
    | "error"
  currentChunk: number
  totalChunks: number
  processedRows: number
  totalRows: number
  message?: string
}

export type ResetItemStatus = "deleted" | "error" | "skipped"

export interface ResetItemResult {
  category: string
  label: string
  status: ResetItemStatus
  message?: string
}

export interface ResetReport {
  deleted: number
  skipped: number
  errors: number
  items: ResetItemResult[]
}

export interface ResetProgress {
  phase: "idle" | "running" | "done" | "error"
  processed: number
  total: number
  message?: string
}
