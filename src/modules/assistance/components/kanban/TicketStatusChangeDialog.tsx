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
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

const dialogCopy: Record<
  StatusChangeDialogKind,
  { title: string; description: string; label: string; placeholder: string }
> = {
  solution: {
    title: "Marquer comme terminé",
    description:
      "Le passage en « Terminé » nécessite une description de la solution apportée.",
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
  onConfirm: (comment: string) => Promise<void>
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
  const copy = kind ? dialogCopy[kind] : null

  useEffect(() => {
    if (!open) {
      setComment("")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!comment.trim()) {
      return
    }

    try {
      await onConfirm(comment.trim())
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
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
