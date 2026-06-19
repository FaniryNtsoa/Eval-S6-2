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
      "Ce ticket était terminé. Choisissez une annulation (erreur de classement) ou une réouverture avec frais.",
    label: "Motif de réouverture",
    placeholder: "Pourquoi ce ticket doit-il être traité à nouveau ?",
  },
}

export type ReopenChoice = "cancel" | "reopen"

interface TicketStatusChangeDialogProps {
  open: boolean
  kind: StatusChangeDialogKind | null
  ticketTitle?: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (comment: string, supercost?: number) => Promise<void>
  onReopenChoice?: (
    choice: ReopenChoice,
    percentage?: number,
    mode?: 1 | 2 | 3 | 4,
  ) => Promise<void>
}

export function TicketStatusChangeDialog({
  open,
  kind,
  ticketTitle,
  isSubmitting,
  onOpenChange,
  onConfirm,
  onReopenChoice,
}: TicketStatusChangeDialogProps) {
  const [comment, setComment] = useState("")
  const [supercost, setSupercost] = useState("")
  const [percentage, setPercentage] = useState("10")
  const [reopenMode, setReopenMode] = useState<1 | 2 | 3 | 4>(1)
  const copy = kind ? dialogCopy[kind] : null

  useEffect(() => {
    if (!open) {
      setComment("")
      setSupercost("")
      setPercentage("10")
      setReopenMode(1)
    }
  }, [open])

  const parsedSupercost = Number.parseFloat(supercost.replace(",", "."))
  const isSupercostValid =
    kind !== "solution" || (!Number.isNaN(parsedSupercost) && parsedSupercost >= 0)

  const parsedPercentage = Number.parseFloat(percentage.replace(",", "."))
  const isPercentageValid =
    !Number.isNaN(parsedPercentage) && parsedPercentage > 0

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

  const handleReopenChoice = async (choice: ReopenChoice) => {
    if (choice === "reopen" && !isPercentageValid) {
      return
    }

    try {
      await onReopenChoice?.(
        choice,
        choice === "reopen" ? parsedPercentage : undefined,
        choice === "reopen" ? reopenMode : undefined,
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

        {kind === "reopen" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Erreur de classement : supprime le dernier supercost enregistré
                pour ce ticket.
              </p>
              <Button
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => void handleReopenChoice("cancel")}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Annulation
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Réouverture : frais calculés selon le mode choisi.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="status-change-percentage">Pourcentage (%)</Label>
                  <Input
                    id="status-change-percentage"
                    type="number"
                    min="0"
                    step="0.01"
                    value={percentage}
                    onChange={(event) => setPercentage(event.target.value)}
                    placeholder="10"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-change-mode">Mode</Label>
                  <select
                    id="status-change-mode"
                    value={reopenMode}
                    onChange={(event) =>
                      setReopenMode(Number(event.target.value) as 1 | 2 | 3 | 4)
                    }
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value={1}>1- last SPcost</option>
                    <option value={2}>2- first SPcost </option>
                    <option value={3}>3- average SPcost</option>
                    <option value={4}>4- sum SPcost</option>

                  </select>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={isSubmitting || !isPercentageValid}
                onClick={() => void handleReopenChoice("reopen")}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Réouverture
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                  <Label htmlFor="status-change-supercost">
                    Supercost (coût fixe)
                  </Label>
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
                Fermer
              </Button>
              <Button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !comment.trim() || !isSupercostValid}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Confirmer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
