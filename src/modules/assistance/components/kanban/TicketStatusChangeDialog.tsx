import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import type { StatusChangeDialogKind } from "@/modules/assistance/constants/kanban"
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
import { cn } from "@/shared/lib/utils"

const dialogCopy: Record<
  StatusChangeDialogKind,
  { title: string; description: string; label: string; placeholder: string }
> = {
  solution: {
    title: "Marquer comme terminé",
    description:
      "Le passage en « Terminé » nécessite une solution et un supercost (coût fixe).",
    label: "Solution",
    placeholder: "Décrivez la solution apportée…",
  },
  reopen: {
    title: "Rouvrir le ticket",
    description:
      "Indiquez la raison de la réouverture avant de changer le statut.",
    label: "Motif de réouverture",
    placeholder: "Pourquoi ce ticket doit-il être traité à nouveau ?",
  },
}

interface TicketStatusChangeDialogProps {
  open: boolean
  kind: StatusChangeDialogKind | null
  ticketTitle?: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (comment: string, supercost?: number) => Promise<void>
}

export function TicketStatusChangeDialog({
  open,
  kind,
  ticketTitle,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: TicketStatusChangeDialogProps) {
  const [comment, setComment] = useState("")
  const [supercost, setSupercost] = useState("")
  const copy = kind ? dialogCopy[kind] : null

  useEffect(() => {
    if (!open) {
      setComment("")
      setSupercost("")
    }
  }, [open])

  const parsedSupercost = Number.parseFloat(supercost.replace(",", "."))
  const isSupercostValid =
    kind !== "solution" || (!Number.isNaN(parsedSupercost) && parsedSupercost > 0)

  const handleSubmit = async () => {
    if (!comment.trim() || !isSupercostValid) {
      return
    }

    try {
      await onConfirm(
        comment.trim(),
        kind === "solution" ? parsedSupercost : undefined,
      )
    } catch {
      // L'erreur est affichée par la page parente via usePublicTickets.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy?.title ?? "Changement de statut"}</DialogTitle>
          <DialogDescription>
            {copy?.description}
            {ticketTitle && (
              <span className="mt-2 block font-medium text-foreground">
                {ticketTitle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-change-comment">{copy?.label}</Label>
            <textarea
              id="status-change-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={copy?.placeholder}
              rows={4}
              disabled={isSubmitting}
              className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          {kind === "solution" && (
            <div className="space-y-2">
              <Label htmlFor="status-change-supercost">Supercost (coût fixe)</Label>
              <Input
                id="status-change-supercost"
                type="number"
                min="0"
                step="0.01"
                value={supercost}
                onChange={(event) => setSupercost(event.target.value)}
                placeholder="Ex. 15000"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !comment.trim() || !isSupercostValid}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
