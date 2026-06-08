import { type FormEvent, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Ticket,
  X,
} from "lucide-react"

import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
} from "@/modules/assistance/constants/ticket-labels"
import { useCreateTicket } from "@/modules/assistance/hooks/useCreateTicket"
import {
  DEFAULT_CREATE_TICKET_FORM,
  type CreateTicketFormValues,
  type TicketLinkedElement,
} from "@/modules/assistance/types/ticket.types"
import { useElements } from "@/modules/inventory/hooks/useElements"
import type { ElementListItem } from "@/modules/inventory/types/element.types"
import {
  EMPTY_ELEMENT_SEARCH,
  type ElementSearchCriteria,
} from "@/modules/inventory/types/element.types"
import { resolveElementRef } from "@/modules/inventory/utils/elementField"
import {
  collectUniqueValues,
  filterElements,
} from "@/modules/inventory/utils/filterElements"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
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
import { Separator } from "@/shared/components/ui/separator"
import { Skeleton } from "@/shared/components/ui/skeleton"
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
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

interface CreateTicketFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (result: { ticketId: number; warnings: string[] }) => void
}

function elementKey(element: Pick<ElementListItem, "itemType" | "id">): string {
  return `${element.itemType}-${element.id}`
}

function toLinkedElement(element: ElementListItem): TicketLinkedElement {
  return {
    itemType: element.itemType,
    itemId: element.id,
  }
}

function hasActiveFilters(criteria: ElementSearchCriteria): boolean {
  return Object.values(criteria).some((value) => value.trim().length > 0)
}

function resetFormState() {
  return {
    form: DEFAULT_CREATE_TICKET_FORM,
    selectedKeys: new Set<string>(),
    criteria: EMPTY_ELEMENT_SEARCH,
    validationError: null as string | null,
  }
}

export function CreateTicketFormModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTicketFormModalProps) {
  const [form, setForm] = useState<CreateTicketFormValues>(
    DEFAULT_CREATE_TICKET_FORM,
  )
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [criteria, setCriteria] = useState<ElementSearchCriteria>(
    EMPTY_ELEMENT_SEARCH,
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const { elements, isLoading: isLoadingElements, error: elementsError } =
    useElements()
  const { isSubmitting, error, result, submit, reset } = useCreateTicket()

  const filteredElements = useMemo(
    () => filterElements(elements, criteria),
    [criteria, elements],
  )

  const selectedElements = useMemo(
    () =>
      elements
        .filter((element) => selectedKeys.has(elementKey(element)))
        .map(toLinkedElement),
    [elements, selectedKeys],
  )

  const itemTypes = useMemo(
    () =>
      collectUniqueValues(elements, (element) => element.itemType).map(
        (type) => ({
          value: type,
          label:
            elements.find((element) => element.itemType === type)
              ?.itemTypeLabel ?? type,
        }),
      ),
    [elements],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    const initial = resetFormState()
    setForm(initial.form)
    setSelectedKeys(initial.selectedKeys)
    setCriteria(initial.criteria)
    setValidationError(initial.validationError)
    reset()
  }, [open, reset])

  const updateForm = <K extends keyof CreateTicketFormValues>(
    key: K,
    value: CreateTicketFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setValidationError(null)
    reset()
  }

  const updateCriteria = <K extends keyof ElementSearchCriteria>(
    key: K,
    value: ElementSearchCriteria[K],
  ) => {
    setCriteria((current) => ({ ...current, [key]: value }))
  }

  const toggleElement = (element: ElementListItem) => {
    const key = elementKey(element)

    setSelectedKeys((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
    reset()
  }

  const removeSelected = (element: TicketLinkedElement) => {
    setSelectedKeys((current) => {
      const next = new Set(current)
      next.delete(`${element.itemType}-${element.itemId}`)
      return next
    })
    reset()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)
    reset()

    if (!form.title.trim()) {
      setValidationError("Le titre est obligatoire.")
      return
    }

    if (!form.description.trim()) {
      setValidationError("La description est obligatoire.")
      return
    }

    const created = await submit(form, selectedElements)

    if (created) {
      onSuccess(created)
    }
  }

  const displayError = validationError ?? error ?? elementsError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="space-y-3 border-b bg-muted/30 px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Ticket className="size-4" />
            </span>
            Créer un ticket
          </DialogTitle>
          <DialogDescription className="text-left">
            Renseignez les informations du ticket et associez un ou plusieurs
            éléments de l&apos;inventaire.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex max-h-[min(75vh,40rem)] flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            {result && (
              <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>Ticket créé</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    Le ticket{" "}
                    <span className="font-mono">#{result.ticketId}</span> a été
                    créé.
                  </p>
                  {result.warnings.length > 0 && (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {displayError && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modal-ticket-title">Titre</Label>
                <Input
                  id="modal-ticket-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Ex. Panne imprimante salle A12"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modal-ticket-description">Description</Label>
                <textarea
                  id="modal-ticket-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Décrivez le problème ou la demande…"
                  rows={4}
                  disabled={isSubmitting}
                  required
                  className={cn(
                    selectClassName,
                    "h-auto min-h-[96px] resize-y py-2",
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-ticket-type">Type</Label>
                <select
                  id="modal-ticket-type"
                  value={form.type}
                  onChange={(event) =>
                    updateForm("type", Number(event.target.value))
                  }
                  className={selectClassName}
                  disabled={isSubmitting}
                >
                  {Object.entries(TICKET_TYPE_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-ticket-priority">Priorité</Label>
                <select
                  id="modal-ticket-priority"
                  value={form.priority}
                  onChange={(event) =>
                    updateForm("priority", Number(event.target.value))
                  }
                  className={selectClassName}
                  disabled={isSubmitting}
                >
                  {Object.entries(TICKET_PRIORITY_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-ticket-status">Statut</Label>
                <select
                  id="modal-ticket-status"
                  value={form.status}
                  onChange={(event) =>
                    updateForm("status", Number(event.target.value))
                  }
                  className={selectClassName}
                  disabled={isSubmitting}
                >
                  {Object.entries(TICKET_STATUS_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-ticket-external-id">
                  Référence externe
                </Label>
                <Input
                  id="modal-ticket-external-id"
                  value={form.externalId}
                  onChange={(event) =>
                    updateForm("externalId", event.target.value)
                  }
                  placeholder="Optionnel"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Éléments associés</p>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez un ou plusieurs actifs à lier au ticket.
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedElements.length} sélectionné(s)
                </Badge>
              </div>

              {selectedElements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {elements
                    .filter((element) => selectedKeys.has(elementKey(element)))
                    .map((element) => (
                      <Badge
                        key={elementKey(element)}
                        variant="outline"
                        className="gap-1 pr-1"
                      >
                        <span>
                          {element.itemTypeLabel} —{" "}
                          {element.name || `#${element.id}`}
                        </span>
                        <button
                          type="button"
                          className="rounded-sm p-0.5 hover:bg-muted"
                          onClick={() =>
                            removeSelected(toLinkedElement(element))
                          }
                          disabled={isSubmitting}
                          aria-label={`Retirer ${element.name ?? element.id}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="modal-element-search">Recherche</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="modal-element-search"
                      value={criteria.query}
                      onChange={(event) =>
                        updateCriteria("query", event.target.value)
                      }
                      placeholder="Nom, n° inventaire, type…"
                      className="h-10 bg-background pl-9"
                      disabled={isLoadingElements}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-element-type">Type d&apos;élément</Label>
                  <select
                    id="modal-element-type"
                    value={criteria.itemType}
                    onChange={(event) =>
                      updateCriteria("itemType", event.target.value)
                    }
                    className={selectClassName}
                    disabled={isLoadingElements || itemTypes.length === 0}
                  >
                    <option value="">Tous les types</option>
                    {itemTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters(criteria) && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCriteria(EMPTY_ELEMENT_SEARCH)}
                    >
                      <X className="size-4" />
                      Réinitialiser
                    </Button>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border">
                {isLoadingElements ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-10 w-full" />
                    ))}
                  </div>
                ) : elements.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="Aucun élément"
                    description="Aucun actif disponible dans l'inventaire GLPI."
                  />
                ) : filteredElements.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="Aucun résultat"
                    description="Aucun élément ne correspond aux critères."
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCriteria(EMPTY_ELEMENT_SEARCH)}
                      >
                        Réinitialiser
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12" />
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Statut
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredElements.map((element) => {
                        const isSelected = selectedKeys.has(elementKey(element))

                        return (
                          <TableRow
                            key={elementKey(element)}
                            className="cursor-pointer"
                            onClick={() => toggleElement(element)}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleElement(element)}
                                onClick={(event) => event.stopPropagation()}
                                disabled={isSubmitting}
                                className="size-4 rounded border-input"
                                aria-label={`Sélectionner ${element.name ?? element.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{element.id}
                            </TableCell>
                            <TableCell className="text-sm">
                              {element.itemTypeLabel}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate font-medium">
                              {element.name || "—"}
                            </TableCell>
                            <TableCell className="hidden text-sm sm:table-cell">
                              {resolveElementRef(element.status)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {selectedElements.length} élément(s) sélectionné(s)
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Créer le ticket
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
