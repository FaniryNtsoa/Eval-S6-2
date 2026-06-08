import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AlertTriangle, Plus, Upload } from "lucide-react"

import { useUnifiedImport } from "@/modules/import/orchestrator/hooks/useUnifiedImport"
import type { ImportReport } from "@/modules/import/common/types/import-result.types"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { ImportFormModal } from "@/shared/components/layout/admin/ImportFormModal"
import { ImportStatusBadge } from "@/shared/components/layout/admin/StatusBadge"
import { StatCard } from "@/shared/components/layout/admin/StatCard"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

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
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={report.totalRows} />
        <StatCard label="Créés" value={report.created} tone="success" />
        <StatCard label="Mis à jour" value={report.updated} tone="info" />
        <StatCard label="Erreurs" value={report.errors} tone="danger" />
      </div>

      {report.rows.length > 0 && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ligne</TableHead>
                <TableHead>{identifierLabel}</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>ID GLPI</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.map((row) => (
                <TableRow key={`${title}-${row.rowIndex}`}>
                  <TableCell>{row.rowIndex}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.identifier}
                  </TableCell>
                  <TableCell>
                    <ImportStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>{row.glpiId ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {row.message ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

export function UnifiedImportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1")

  const { progress, result, isRunning, error, reset, runImport } =
    useUnifiedImport()

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!isRunning && result?.success && modalOpen) {
      setModalOpen(false)
    }
  }, [isRunning, result, modalOpen])

  const hasResults =
    result?.success &&
    ((result.reports.assets?.totalRows ?? 0) > 0 ||
      (result.reports.tickets?.totalRows ?? 0) > 0 ||
      (result.reports.costs?.totalRows ?? 0) > 0)

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Import GLPI"
        description="Importez actifs, tickets et coûts en une seule opération."
      >
        <Button onClick={() => setModalOpen(true)} disabled={isRunning}>
          <Plus className="size-4" />
          Nouvel import
        </Button>
      </AdminPageHeader>

      <ImportFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isRunning={isRunning}
        error={error}
        progress={progress}
        onImport={runImport}
        onClear={reset}
      />

      {!hasResults && !isRunning && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Upload}
              title="Aucun import récent"
              description="Lancez un import pour synchroniser vos fichiers CSV avec GLPI."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Lancer un import
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {hasResults && (
        <div className="space-y-8">
          <ReportSection
            title="Actifs"
            report={result.reports.assets!}
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
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="text-amber-600 dark:text-amber-400" />
          <AlertTitle>Rollback effectué</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            {result.reports.rollback.deleted} éléments supprimés,{" "}
            {result.reports.rollback.errors} erreur(s) pendant la
            réinitialisation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
