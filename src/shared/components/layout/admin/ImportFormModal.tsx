import { useRef, useState, type ChangeEvent } from "react"
import { AlertTriangle, FileSpreadsheet, Info } from "lucide-react"

import type { ImportProgress } from "@/modules/import/common/types/import-result.types"
import { CsvFileField } from "@/shared/components/layout/admin/CsvFileField"
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
import { Progress } from "@/shared/components/ui/progress"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/lib/utils"

interface ImportFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRunning: boolean
  error: string | null
  progress: ImportProgress
  onImport: (files: {
    assets: File
    tickets: File
    costs: File
  }) => Promise<unknown>
  onClear: () => void
}

const fileFields = [
  {
    id: "modal-assets-csv",
    step: 1,
    label: "Actifs",
    hint: "En-tête seul accepté. Si vide, les tickets et coûts qui en dépendent échoueront.",
    key: "assets" as const,
  },
  {
    id: "modal-tickets-csv",
    step: 2,
    label: "Tickets",
    hint: "En-tête seul accepté. Si vide, les coûts qui référencent des tickets échoueront.",
    key: "tickets" as const,
  },
  {
    id: "modal-costs-csv",
    step: 3,
    label: "Coûts tickets",
    hint: "En-tête seul accepté. Nécessite des tickets correspondants si des lignes sont présentes.",
    key: "costs" as const,
  },
]

export function ImportFormModal({
  open,
  onOpenChange,
  isRunning,
  error,
  progress,
  onImport,
  onClear,
}: ImportFormModalProps) {
  const assetsInputRef = useRef<HTMLInputElement>(null)
  const ticketsInputRef = useRef<HTMLInputElement>(null)
  const costsInputRef = useRef<HTMLInputElement>(null)

  const inputRefs = {
    assets: assetsInputRef,
    tickets: ticketsInputRef,
    costs: costsInputRef,
  }

  const [assetsFile, setAssetsFile] = useState<File | null>(null)
  const [ticketsFile, setTicketsFile] = useState<File | null>(null)
  const [costsFile, setCostsFile] = useState<File | null>(null)

  const files = {
    assets: assetsFile,
    tickets: ticketsFile,
    costs: costsFile,
  }

  const setters = {
    assets: setAssetsFile,
    tickets: setTicketsFile,
    costs: setCostsFile,
  }

  const allFilesSelected = assetsFile && ticketsFile && costsFile
  const selectedCount = [assetsFile, ticketsFile, costsFile].filter(Boolean).length

  const handleFileChange =
    (key: keyof typeof files) => (event: ChangeEvent<HTMLInputElement>) => {
      setters[key](event.target.files?.[0] ?? null)
      onClear()
    }

  const clearFile = (key: keyof typeof files) => {
    setters[key](null)
    onClear()
    const ref = inputRefs[key].current
    if (ref) {
      ref.value = ""
    }
  }

  const clearAllFiles = () => {
    setAssetsFile(null)
    setTicketsFile(null)
    setCostsFile(null)
    onClear()

    for (const ref of Object.values(inputRefs)) {
      if (ref.current) {
        ref.current.value = ""
      }
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isRunning) {
      return
    }

    if (!nextOpen) {
      clearAllFiles()
    }

    onOpenChange(nextOpen)
  }

  const handleImport = async () => {
    if (!assetsFile || !ticketsFile || !costsFile) {
      return
    }

    await onImport({
      assets: assetsFile,
      tickets: ticketsFile,
      costs: costsFile,
    })
  }

  const progressPercent =
    progress.totalRows > 0
      ? Math.round((progress.processedRows / progress.totalRows) * 100)
      : progress.phase === "rollback" && progress.totalRows === 0
        ? undefined
        : 0

  const progressValue =
    progress.phase === "rollback" && progress.totalRows === 0
      ? 100
      : (progressPercent ?? 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={!isRunning}>
        <DialogHeader className="space-y-3 border-b bg-muted/30 px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="size-4" />
            </span>
            Import GLPI
          </DialogTitle>
          <DialogDescription className="text-left">
            Sélectionnez les trois fichiers CSV dans l&apos;ordre. Chaque fichier
            peut ne contenir que l&apos;en-tête — les phases suivantes
            échoueront alors et déclencheront un rollback si nécessaire.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60vh,32rem)] space-y-4 overflow-y-auto px-6 py-5">
          <Alert className="border-border/80 bg-muted/30">
            <Info className="size-4" />
            <AlertTitle className="text-sm">Ordre d&apos;exécution</AlertTitle>
            <AlertDescription>
              Actifs → Tickets → Coûts. Des données en aval sans amont
              correspondant provoquent une erreur et un rollback automatique.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {fileFields.map((field) => (
              <CsvFileField
                key={field.key}
                id={field.id}
                step={field.step}
                label={field.label}
                hint={field.hint}
                file={files[field.key]}
                inputRef={inputRefs[field.key]}
                onChange={handleFileChange(field.key)}
                onClear={() => clearFile(field.key)}
                disabled={isRunning}
              />
            ))}
          </div>

          {isRunning && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{progress.message}</span>
                  {progressPercent !== undefined && (
                    <span className="font-medium tabular-nums">
                      {progressPercent}%
                    </span>
                  )}
                </div>
                <Progress
                  value={progressValue}
                  className={cn(
                    "h-2",
                    progress.phase === "rollback" &&
                      "[&_[data-slot=progress-indicator]]:bg-amber-500",
                  )}
                />
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selectedCount}/3 fichiers sélectionnés
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isRunning}
            >
              Annuler
            </Button>
            {selectedCount > 0 && !isRunning && (
              <Button variant="ghost" onClick={clearAllFiles}>
                Tout effacer
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={!allFilesSelected || isRunning}
            >
              {isRunning ? "Import en cours…" : "Lancer l'import"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
