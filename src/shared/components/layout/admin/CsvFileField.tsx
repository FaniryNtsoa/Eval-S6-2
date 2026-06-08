import { useRef, type ChangeEvent, type RefObject } from "react"
import { Check, FileUp, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} o`
  }

  return `${(bytes / 1024).toFixed(1)} Ko`
}

interface CsvFileFieldProps {
  id: string
  step: number
  label: string
  hint?: string
  file: File | null
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  disabled?: boolean
}

export function CsvFileField({
  id,
  step,
  label,
  hint,
  file,
  inputRef,
  onChange,
  onClear,
  disabled,
}: CsvFileFieldProps) {
  const localRef = useRef<HTMLInputElement>(null)
  const ref = inputRef ?? localRef

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-muted/20 p-4 transition-colors",
        file && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            file
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {step}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>

          {file ? (
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
              <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-muted-foreground"
                  onClick={onClear}
                  aria-label="Retirer le fichier"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => ref.current?.click()}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-5 text-sm text-muted-foreground transition-colors",
                "hover:border-primary/40 hover:bg-background hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <FileUp className="size-4" />
              Cliquer pour choisir un fichier CSV
            </button>
          )}

          <input
            ref={ref}
            id={id}
            type="file"
            accept=".csv,text/csv"
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />

          {hint && (
            <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
