import { useRef, useState } from "react"
import { AlertTriangle, FileSpreadsheet } from "lucide-react"

import type { ImportProgress } from "@/modules/import/common/types/import-result.types"
import type { MvtImportFiles } from "@/modules/import/orchestrator/types/mvt-import-types"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { CsvFileField } from "@/shared/components/layout/admin/CsvFileField"

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

interface ImportMvtFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isRunning: boolean
    error: string | null
    progress: ImportProgress
    onImport: (files: MvtImportFiles) => Promise<unknown>
    onClear: () => void
}

const fileField = {
    id: "modal-mvt-csv",
    step: 1,
    label: "Mouvements",
    hint: "CSV sans en-tête ou avec en-tête : ticket,mvt,valeur. Ex. 2,open,5",
    accept: ".csv,text/csv",
    chooseLabel: "Choisir le CSV mouvements",
}

export function ImportMvtFormModal({
    open,
    onOpenChange,
    isRunning,
    error,
    progress,
    onImport,
    onClear,
}: ImportMvtFormModalProps) {


    const mvtInputRef = useRef<HTMLInputElement>(null)
    const [mvtFile, setMvtFile] = useState<File | null>(null)
    const canImport = mvtFile !== null
    const selectedCount = mvtFile ? 1 : 0
    const requiredCount = 1

    const clearAllFiles = () => {
        setMvtFile(null)
        onClear()
        if (mvtInputRef.current) mvtInputRef.current.value = ""
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (isRunning) return
        if (!nextOpen) clearAllFiles()
        onOpenChange(nextOpen)
    }

    const handleImport = async () => {
        if (!canImport || !mvtFile) return
        await onImport({ mvt: mvtFile })
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
                        Import Mvt
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        Sélectionnez 1 fichier CSV obligatoire.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-5">
                    <CsvFileField
                        id={fileField.id}
                        step={fileField.step}
                        label={fileField.label}
                        hint={fileField.hint}
                        accept={fileField.accept}
                        chooseLabel={fileField.chooseLabel}
                        file={mvtFile}
                        inputRef={mvtInputRef}
                        onChange={(e) => {
                            setMvtFile(e.target.files?.[0] ?? null)
                            onClear()
                        }}
                        onClear={() => {
                            setMvtFile(null)
                            onClear()
                            if (mvtInputRef.current) mvtInputRef.current.value = ""
                        }}
                        disabled={isRunning}
                    />
                </div>
                <div>
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
                        {selectedCount}/{requiredCount} fichiers sélectionnés
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
                        <Button onClick={handleImport} disabled={!canImport || isRunning}>
                            {isRunning ? "Import en cours…" : "Lancer l'import"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
