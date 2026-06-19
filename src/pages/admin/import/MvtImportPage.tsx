import { useState } from "react"
import { Plus, Upload } from "lucide-react"

import { useMvtImport } from "@/modules/import/orchestrator/hooks/useMvtImport"
import {
  MVT_ACTION_OPTIONS,
  traiter,
  type MvtAction,
} from "@/modules/import/orchestrator/services/mvtImportService"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { ImportMvtFormModal } from "@/shared/components/layout/admin/ImportMvtFormModal"
import { ImportStatusBadge } from "@/shared/components/layout/admin/StatusBadge"
import { StatCard } from "@/shared/components/layout/admin/StatCard"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { cn } from "@/shared/lib/utils"

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

export function MvtImportPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { progress, report, isRunning, error, reset, runImport } = useMvtImport()

  const [ticketRef, setTicketRef] = useState("")
  const [action, setAction] = useState<MvtAction | "">("")
  const [valeur, setValeur] = useState("")
  const [resultat, setResultat] = useState("")
  const [manualLoading, setManualLoading] = useState(false)
  const [mode, setMode] = useState<1 | 2 | 3 | 4>(1)

  const valeurRequired = action === "open" || action === "close"

  async function handleClickManuel() {
    if (!action) {
      setResultat("Choisissez un mouvement")
      return
    }

    setManualLoading(true)
    setResultat("")
    try {
      const { message } = await traiter(
        ticketRef,
        action,
        valeurRequired ? valeur : undefined,
        action === "open" ? String(mode) : undefined,
      )
      setResultat(message)
    } catch (e) {
      setResultat(getErrorMessage(e))
    } finally {
      setManualLoading(false)
    }
  }

  const hasResults = (report?.totalRows ?? 0) > 0

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Import mouvements"
        description="Applique open/close/cancel sur les tickets via Ref_Ticket (SQLite + GLPI)."
      >
        <Button onClick={() => setModalOpen(true)} disabled={isRunning}>
          <Plus className="size-4" />
          Nouvel import
        </Button>
      </AdminPageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Saisie manuelle</CardTitle>
          <CardDescription>
            open : ticket fermé · close : ticket en cours · cancel : ticket fermé avec supercost
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="mvt-ticket">Ticket (ref)</Label>
              <Input
                id="mvt-ticket"
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                placeholder="2"
                disabled={manualLoading || isRunning}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mvt-action">Mouvement</Label>
              <select
                id="mvt-action"
                value={action}
                onChange={(e) => {
                  const next = e.target.value as MvtAction | ""
                  setAction(next)
                  if (next === "cancel") setValeur("")
                }}
                className={selectClassName}
                disabled={manualLoading || isRunning}
              >
                <option value="">Choisir…</option>
                {MVT_ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mvt-valeur">
                Valeur {action === "cancel" ? "(non requise)" : ""}
              </Label>
              <Input
                id="mvt-valeur"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                placeholder={action === "cancel" ? "—" : "5 ou 100"}
                disabled={!valeurRequired || manualLoading || isRunning}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mvt-mode">Mode (open)</Label>
              <select
                id="mvt-mode"
                value={mode}
                onChange={(e) =>
                  setMode(Number(e.target.value) as 1 | 2 | 3 | 4)
                }
                className={selectClassName}
                disabled={action !== "open" || manualLoading || isRunning}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleClickManuel}
            disabled={manualLoading || isRunning || !ticketRef.trim() || !action}
          >
            {manualLoading ? "Traitement…" : "Traiter"}
          </Button>
        </CardContent>
        {resultat && (
          <CardContent className="pt-0">
            <p
              className={cn(
                "text-sm",
                resultat.startsWith("OK") ? "text-foreground" : "text-destructive",
              )}
            >
              <strong>{resultat}</strong>
            </p>
          </CardContent>
        )}
      </Card>

      <ImportMvtFormModal
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
              title="Aucun import mouvement"
              description="Exemple CSV : 2,open,5,1 puis 2,close,100"
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Lancer l&apos;import
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {hasResults && report && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total" value={report.totalRows} />
            <StatCard label="OK" value={report.updated} tone="success" />
            <StatCard label="Erreurs" value={report.errors} tone="danger" />
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ligne</TableHead>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>ID GLPI</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.rowIndex}>
                    <TableCell>{row.rowIndex}</TableCell>
                    <TableCell className="font-mono text-xs">{row.identifier}</TableCell>
                    <TableCell>
                      <ImportStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{row.glpiId ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.message ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  )
}
