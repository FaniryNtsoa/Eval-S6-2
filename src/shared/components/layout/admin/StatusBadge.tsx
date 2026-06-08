import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

type ImportStatus = "created" | "updated" | "error"
type ResetStatus = "deleted" | "error" | "skipped"

const importLabels: Record<ImportStatus, string> = {
  created: "Créé",
  updated: "Mis à jour",
  error: "Erreur",
}

const resetLabels: Record<ResetStatus, string> = {
  deleted: "Supprimé",
  error: "Erreur",
  skipped: "Ignoré",
}

const importStyles: Record<ImportStatus, string> = {
  created:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  updated:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
}

const resetStyles: Record<ResetStatus, string> = {
  deleted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  skipped: "border-border bg-muted text-muted-foreground",
}

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  return (
    <Badge variant="outline" className={cn(importStyles[status])}>
      {importLabels[status]}
    </Badge>
  )
}

export function ResetStatusBadge({ status }: { status: ResetStatus }) {
  return (
    <Badge variant="outline" className={cn(resetStyles[status])}>
      {resetLabels[status]}
    </Badge>
  )
}
