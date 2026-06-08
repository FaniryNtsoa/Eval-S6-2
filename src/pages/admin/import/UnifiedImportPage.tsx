import { useRef, useState, type ChangeEvent } from "react"

import { useUnifiedImport } from "@/modules/import/orchestrator/hooks/useUnifiedImport"
import type { ImportReport } from "@/modules/import/common/types/import-result.types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

function StatusBadge({
  status,
}: {
  status: "created" | "updated" | "error"
}) {
  const styles = {
    created: "bg-emerald-100 text-emerald-800",
    updated: "bg-blue-100 text-blue-800",
    error: "bg-red-100 text-red-800",
  }

  const labels = {
    created: "Créé",
    updated: "Mis à jour",
    error: "Erreur",
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  )
}

function ReportSection({
  title,
  report,
  identifierLabel,
}: {
  title: string
  report: ImportReport
  identifierLabel: string
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{report.totalRows}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Créés</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {report.created}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Mis à jour</p>
          <p className="text-2xl font-semibold text-blue-600">
            {report.updated}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Erreurs</p>
          <p className="text-2xl font-semibold text-red-600">
            {report.errors}
          </p>
        </div>
      </div>

      {report.rows.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Ligne</th>
                <th className="px-4 py-3 font-medium">{identifierLabel}</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">ID GLPI</th>
                <th className="px-4 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row) => (
                <tr key={`${title}-${row.rowIndex}`} className="border-t border-border">
                  <td className="px-4 py-3">{row.rowIndex}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.identifier}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">{row.glpiId ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.message ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function UnifiedImportPage() {
  const assetsInputRef = useRef<HTMLInputElement>(null)
  const ticketsInputRef = useRef<HTMLInputElement>(null)
  const costsInputRef = useRef<HTMLInputElement>(null)

  const [assetsFile, setAssetsFile] = useState<File | null>(null)
  const [ticketsFile, setTicketsFile] = useState<File | null>(null)
  const [costsFile, setCostsFile] = useState<File | null>(null)

  const { progress, result, isRunning, error, reset, runImport } =
    useUnifiedImport()

  const allFilesSelected = assetsFile && ticketsFile && costsFile

  const handleFileChange =
    (setter: (file: File | null) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.files?.[0] ?? null)
      reset()
    }

  const handleImport = async () => {
    if (!assetsFile || !ticketsFile || !costsFile) {
      return
    }

    await runImport({
      assets: assetsFile,
      tickets: ticketsFile,
      costs: costsFile,
    })
  }

  const handleResetForm = () => {
    setAssetsFile(null)
    setTicketsFile(null)
    setCostsFile(null)
    reset()

    for (const ref of [assetsInputRef, ticketsInputRef, costsInputRef]) {
      if (ref.current) {
        ref.current.value = ""
      }
    }
  }

  const progressPercent =
    progress.totalRows > 0
      ? Math.round((progress.processedRows / progress.totalRows) * 100)
      : progress.phase === "rollback" && progress.totalRows === 0
        ? undefined
        : 0

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Import GLPI
        </h1>
        <p className="text-muted-foreground">
          Importez actifs, tickets et coûts en une seule opération (ordre
          1 → 2 → 3). En cas d&apos;erreur, un rollback automatique
          réinitialise GLPI.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="assets-csv-file"
              className="text-sm font-medium text-foreground"
            >
              1. Actifs (obligatoire)
            </label>
            <input
              ref={assetsInputRef}
              id="assets-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange(setAssetsFile)}
              disabled={isRunning}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Doit contenir des lignes de données.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tickets-csv-file"
              className="text-sm font-medium text-foreground"
            >
              2. Tickets (en-tête seul OK)
            </label>
            <input
              ref={ticketsInputRef}
              id="tickets-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange(setTicketsFile)}
              disabled={isRunning}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="costs-csv-file"
              className="text-sm font-medium text-foreground"
            >
              3. Coûts tickets (en-tête seul OK)
            </label>
            <input
              ref={costsInputRef}
              id="costs-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange(setCostsFile)}
              disabled={isRunning}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Interdit si le fichier tickets est vide.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleImport}
            disabled={!allFilesSelected || isRunning}
          >
            {isRunning ? "Import en cours…" : "Lancer l'import"}
          </Button>
          {allFilesSelected && !isRunning && (
            <Button variant="outline" onClick={handleResetForm}>
              Réinitialiser
            </Button>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.message}</span>
              {progressPercent !== undefined && (
                <span>{progressPercent}%</span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  progress.phase === "rollback" ? "bg-amber-500" : "bg-primary",
                )}
                style={{
                  width: `${
                    progress.phase === "rollback" && progress.totalRows === 0
                      ? 100
                      : progressPercent ?? 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      {result?.success && result.reports.assets && (
        <div className="space-y-8">
          <ReportSection
            title="Actifs"
            report={result.reports.assets}
            identifierLabel="N° inventaire"
          />
          {result.reports.tickets && (
            <ReportSection
              title="Tickets"
              report={result.reports.tickets}
              identifierLabel="Ref_Ticket"
            />
          )}
          {result.reports.costs && (
            <ReportSection
              title="Coûts tickets"
              report={result.reports.costs}
              identifierLabel="Num_Ticket"
            />
          )}
        </div>
      )}

      {result && !result.success && result.reports.rollback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <h3 className="font-medium text-amber-900">Rollback effectué</h3>
          <p className="text-sm text-amber-800">
            {result.reports.rollback.deleted} éléments supprimés,{" "}
            {result.reports.rollback.errors} erreur(s) pendant la
            réinitialisation.
          </p>
        </div>
      )}
    </section>
  )
}
