import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, RotateCcw, ShieldAlert } from "lucide-react"

import { useResetImportData } from "@/modules/import/reset/hooks/useResetImportData"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { ResetFormModal } from "@/shared/components/layout/admin/ResetFormModal"
import { ResetStatusBadge } from "@/shared/components/layout/admin/StatusBadge"
import { StatCard } from "@/shared/components/layout/admin/StatCard"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

function formatCategoryLabel(category: string): string {
  if (category.startsWith("asset-")) {
    return `Actif · ${category.replace("asset-", "")}`
  }

  if (category === "ticket-cost") {
    return "Coût ticket"
  }

  if (category === "ticket") {
    return "Ticket"
  }

  if (category.startsWith("dropdown-")) {
    return `Référence · ${category.replace("dropdown-", "")}`
  }

  if (category === "user") {
    return "Utilisateur"
  }

  return category
}

export function ResetDataPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1")

  const { progress, report, isRunning, error, reset, runReset } =
    useResetImportData()

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!isRunning && report && modalOpen) {
      setModalOpen(false)
    }
  }, [isRunning, report, modalOpen])

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Réinitialiser les données GLPI"
        description="Supprime toutes les données gérées par les imports de l'application."
      >
        <Button
          variant="destructive"
          onClick={() => setModalOpen(true)}
          disabled={isRunning}
        >
          <Plus className="size-4" />
          Réinitialiser
        </Button>
      </AdminPageHeader>

      <ResetFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isRunning={isRunning}
        error={error}
        progress={progress}
        onReset={runReset}
        onClear={reset}
      />

      <Card className="border-destructive/30 bg-destructive/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-4" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Cette opération supprime dans l&apos;ordre les coûts tickets, les
            tickets, les actifs, les utilisateurs (sauf comptes système) et les
            références liées aux imports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!report && !isRunning && (
            <EmptyState
              icon={RotateCcw}
              title="Aucune réinitialisation récente"
              description="Utilisez le bouton ci-dessus pour lancer une suppression."
            />
          )}
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Supprimés" value={report.deleted} tone="success" />
            <StatCard label="Ignorés" value={report.skipped} />
            <StatCard label="Erreurs" value={report.errors} tone="danger" />
          </div>

          {report.items.length > 0 && (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Type</TableHead>
                    <TableHead>Élément</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.map((item, index) => (
                    <TableRow
                      key={`${item.category}-${item.label}-${index}`}
                    >
                      <TableCell>{formatCategoryLabel(item.category)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.label}
                      </TableCell>
                      <TableCell>
                        <ResetStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {item.message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
