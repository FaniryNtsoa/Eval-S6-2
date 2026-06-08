import { useState } from "react"
import { AlertTriangle, ShieldAlert } from "lucide-react"

import type { ResetProgress } from "@/modules/import/common/types/import-result.types"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Progress } from "@/shared/components/ui/progress"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/lib/utils"

const CONFIRMATION_TEXT = "RESET"

const deletionTargets = [
  "Coûts tickets, puis tickets (corbeille incluse)",
  "Actifs supportés (suppression définitive)",
  "Utilisateurs sauf comptes système et API",
  "Références liées aux imports",
]

interface ResetFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRunning: boolean
  error: string | null
  progress: ResetProgress
  onReset: () => Promise<unknown>
  onClear: () => void
}

export function ResetFormModal({
  open,
  onOpenChange,
  isRunning,
  error,
  progress,
  onReset,
  onClear,
}: ResetFormModalProps) {
  const [confirmation, setConfirmation] = useState("")

  const canReset = confirmation === CONFIRMATION_TEXT && !isRunning
  const confirmationMatches = confirmation === CONFIRMATION_TEXT

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0

  const handleOpenChange = (nextOpen: boolean) => {
    if (isRunning) {
      return
    }

    if (!nextOpen) {
      setConfirmation("")
      onClear()
    }

    onOpenChange(nextOpen)
  }

  const handleReset = async () => {
    if (!canReset) {
      return
    }

    await onReset()
    setConfirmation("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton={!isRunning}>
        <DialogHeader className="space-y-3 border-b border-destructive/20 bg-destructive/5 px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base text-destructive">
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldAlert className="size-4" />
            </span>
            Réinitialiser les données
          </DialogTitle>
          <DialogDescription className="text-left">
            Action irréversible. Les cibles sont détectées dynamiquement depuis
            l&apos;API GLPI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Cette opération supprime définitivement les données listées
              ci-dessous.
            </AlertDescription>
          </Alert>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {deletionTargets.map((target) => (
              <li key={target} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/60" />
                {target}
              </li>
            ))}
          </ul>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="modal-reset-confirmation">
              Confirmation
            </Label>
            <p className="text-xs text-muted-foreground">
              Saisissez{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                {CONFIRMATION_TEXT}
              </code>{" "}
              pour continuer
            </p>
            <Input
              id="modal-reset-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value)
                onClear()
              }}
              disabled={isRunning}
              placeholder={CONFIRMATION_TEXT}
              className={cn(
                "font-mono tracking-wider",
                confirmationMatches &&
                  "border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20",
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {isRunning && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{progress.message}</span>
                <span className="font-medium tabular-nums">{progressPercent}%</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRunning}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={!canReset}
          >
            {isRunning ? "Suppression en cours…" : "Réinitialiser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
