import { useState } from "react"
import { Plus, Upload } from "lucide-react"

import { useMvtImport } from "@/modules/import/orchestrator/hooks/useMvtImport"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { ImportMvtFormModal } from "@/shared/components/layout/admin/ImportMvtFormModal"
import { ImportStatusBadge } from "@/shared/components/layout/admin/StatusBadge"
import { StatCard } from "@/shared/components/layout/admin/StatCard"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table"
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { traiter } from "@/modules/import/orchestrator/services/mvtImportService";
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService";
import { CardHeader } from "@/shared/components/ui/card";
import { CardTitle } from "@/shared/components/ui/card";
import { CardDescription } from "@/shared/components/ui/card";

export function MvtImportPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { progress, report, isRunning, error, reset, runImport } = useMvtImport()

  const hasResults = (report?.totalRows ?? 0) > 0

  const [a, setA] = useState("")       // ticket
  const [b, setB] = useState("")       // mvt
  const [c, setC] = useState("")       // valeur
  const [resultat, setResultat] = useState("")
  const [manualLoading, setManualLoading] = useState(false)

  async function handleClickManuel() {
    setManualLoading(true)
    setResultat("")
    try {
      const { message } = await traiter(a, b, c)
      setResultat(message)
    } catch (e) {
      setResultat(getErrorMessage(e))
    } finally {
      setManualLoading(false)
    }
  }

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

      {/* ── BLOC 1 : Saisie manuelle ── */}
      <Card>
        <CardHeader>
          <CardTitle>Saisie manuelle</CardTitle>
          <CardDescription>
            Ex. ticket=2, mvt=open, valeur=5 — ou cancel sans valeur
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="mvt-ticket">Ticket</Label>
              <Input
                id="mvt-ticket"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mvt-action">Mvt</Label>
              <Input
                id="mvt-action"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="open / close / cancel"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mvt-valeur">Valeur</Label>
              <Input
                id="mvt-valeur"
                value={c}
                onChange={(e) => setC(e.target.value)}
                placeholder="5 (vide si cancel)"
              />
            </div>
          </div>
          <Button onClick={handleClickManuel} disabled={manualLoading || isRunning}>
            {manualLoading ? "Traitement…" : "Traiter"}
          </Button>
        </CardContent>
        {resultat && (
          <CardContent className="pt-0">
            <p className="text-sm"><strong>{resultat}</strong></p>
          </CardContent>
        )}
      </Card>


      {/* ── BLOC 2 : Import CSV (modale, inchangée) ── */}
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
              description="Exemple : 2,open,5 puis 2,close,100"
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Lancer l'import
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
                    <TableCell><ImportStatusBadge status={row.status} /></TableCell>
                    <TableCell>{row.glpiId ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.message ?? "—"}</TableCell>
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