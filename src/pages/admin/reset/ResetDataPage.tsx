import { useState } from "react"

import { useResetImportData } from "@/modules/import/reset/hooks/useResetImportData"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

const CONFIRMATION_TEXT = "RESET"

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
  const [confirmation, setConfirmation] = useState("")
  const { progress, report, isRunning, error, reset, runReset } =
    useResetImportData()

  const canReset = confirmation === CONFIRMATION_TEXT && !isRunning

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0

  const handleReset = async () => {
    if (!canReset) {
      return
    }

    await runReset()
    setConfirmation("")
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Réinitialiser les données GLPI
        </h1>
        <p className="text-muted-foreground">
          Supprime toutes les données gérées par les imports de l&apos;application,
          quelle que soit leur origine CSV.
        </p>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <h2 className="font-medium text-destructive">Action irréversible</h2>
        <p className="text-sm text-muted-foreground">
          Les cibles sont détectées dynamiquement depuis l&apos;API GLPI
          (comme pour l&apos;import). Cette opération supprime dans l&apos;ordre :
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            <strong>Tous les coûts tickets</strong>, puis{" "}
            <strong>tous les tickets</strong> (corbeille incluse)
          </li>
          <li>
            <strong>Tous les actifs</strong> des types supportés, y compris la
            corbeille (suppression définitive via <code>force=true</code>)
          </li>
          <li>
            <strong>Tous les utilisateurs</strong> sauf les comptes système et
            le compte API configuré
          </li>
          <li>
            <strong>Toutes les références</strong> liées aux imports : statuts,
            lieux, fabricants, modèles…
          </li>
        </ul>

        <div className="space-y-2">
          <label
            htmlFor="reset-confirmation"
            className="text-sm font-medium text-foreground"
          >
            Tapez <code>{CONFIRMATION_TEXT}</code> pour confirmer
          </label>
          <input
            id="reset-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value)
              if (report || error) {
                reset()
              }
            }}
            disabled={isRunning}
            placeholder={CONFIRMATION_TEXT}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button
          variant="destructive"
          onClick={handleReset}
          disabled={!canReset}
        >
          {isRunning ? "Suppression en cours…" : "Réinitialiser les données"}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.message}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-destructive transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
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

      {report && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Supprimés</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {report.deleted}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Ignorés</p>
              <p className="text-2xl font-semibold">{report.skipped}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Erreurs</p>
              <p className="text-2xl font-semibold text-red-600">
                {report.errors}
              </p>
            </div>
          </div>

          {report.items.length > 0 && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Élément</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, index) => (
                    <tr
                      key={`${item.category}-${item.label}-${index}`}
                      className="border-t border-border"
                    >
                      <td className="px-4 py-3">
                        {formatCategoryLabel(item.category)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.label}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            item.status === "deleted" &&
                              "bg-emerald-100 text-emerald-800",
                            item.status === "error" &&
                              "bg-red-100 text-red-800",
                            item.status === "skipped" &&
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {item.status === "deleted"
                            ? "Supprimé"
                            : item.status === "error"
                              ? "Erreur"
                              : "Ignoré"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.message ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
