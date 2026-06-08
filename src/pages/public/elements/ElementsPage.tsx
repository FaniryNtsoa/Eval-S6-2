import { useMemo, useState } from "react"
import { Database, Plus, RefreshCw, Search, X } from "lucide-react"

import { useCreateTicketModal } from "@/modules/assistance/context/CreateTicketModalContext"
import { useElements } from "@/modules/inventory/hooks/useElements"
import {
  EMPTY_ELEMENT_SEARCH,
  type ElementSearchCriteria,
} from "@/modules/inventory/types/element.types"
import {
  collectUniqueValues,
  filterElements,
} from "@/modules/inventory/utils/filterElements"
import { resolveElementRef } from "@/modules/inventory/utils/elementField"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { EmptyState } from "@/shared/components/layout/admin/EmptyState"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
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

function hasActiveFilters(criteria: ElementSearchCriteria): boolean {
  return Object.values(criteria).some((value) => value.trim().length > 0)
}

export function ElementsPage() {
  const [criteria, setCriteria] = useState<ElementSearchCriteria>(
    EMPTY_ELEMENT_SEARCH,
  )
  const { openCreateTicket } = useCreateTicketModal()
  const { elements, isLoading, error, loadElements } = useElements()

  const filteredElements = useMemo(
    () => filterElements(elements, criteria),
    [criteria, elements],
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

  const statuses = useMemo(
    () =>
      collectUniqueValues(elements, (element) =>
        resolveElementRef(element.status),
      ),
    [elements],
  )

  const locations = useMemo(
    () =>
      collectUniqueValues(elements, (element) =>
        resolveElementRef(element.location),
      ),
    [elements],
  )

  const manufacturers = useMemo(
    () =>
      collectUniqueValues(elements, (element) =>
        resolveElementRef(element.manufacturer),
      ),
    [elements],
  )

  const users = useMemo(
    () =>
      collectUniqueValues(elements, (element) =>
        resolveElementRef(element.user),
      ),
    [elements],
  )

  const updateCriteria = <K extends keyof ElementSearchCriteria>(
    key: K,
    value: ElementSearchCriteria[K],
  ) => {
    setCriteria((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Éléments"
        description="Consultez l'inventaire GLPI et affinez les résultats avec plusieurs critères de recherche."
      >
        <Button variant="default" size="sm" onClick={openCreateTicket}>
          <Plus className="size-4" />
          Créer un ticket
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadElements()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </AdminPageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {isLoading ? "…" : elements.length}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="sm:col-span-2">
          <CardContent className="pt-0">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={criteria.query}
                onChange={(event) => updateCriteria("query", event.target.value)}
                placeholder="Rechercher par nom, n° inventaire, type, statut…"
                className="h-10 bg-background pl-9"
                disabled={isLoading || elements.length === 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Filtres avancés</CardTitle>
              <CardDescription>
                Combinez plusieurs critères pour affiner la liste.
              </CardDescription>
            </div>
            {hasActiveFilters(criteria) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCriteria(EMPTY_ELEMENT_SEARCH)}
              >
                <X className="size-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-type">Type d'élément</Label>
            <select
              id="filter-type"
              value={criteria.itemType}
              onChange={(event) => updateCriteria("itemType", event.target.value)}
              className={selectClassName}
              disabled={isLoading || itemTypes.length === 0}
            >
              <option value="">Tous les types</option>
              {itemTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-status">Statut</Label>
            <select
              id="filter-status"
              value={criteria.status}
              onChange={(event) => updateCriteria("status", event.target.value)}
              className={selectClassName}
              disabled={isLoading || statuses.length === 0}
            >
              <option value="">Tous les statuts</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-location">Localisation</Label>
            <select
              id="filter-location"
              value={criteria.location}
              onChange={(event) =>
                updateCriteria("location", event.target.value)
              }
              className={selectClassName}
              disabled={isLoading || locations.length === 0}
            >
              <option value="">Toutes les localisations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-manufacturer">Fabricant</Label>
            <select
              id="filter-manufacturer"
              value={criteria.manufacturer}
              onChange={(event) =>
                updateCriteria("manufacturer", event.target.value)
              }
              className={selectClassName}
              disabled={isLoading || manufacturers.length === 0}
            >
              <option value="">Tous les fabricants</option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-user">Utilisateur</Label>
            <select
              id="filter-user"
              value={criteria.user}
              onChange={(event) => updateCriteria("user", event.target.value)}
              className={selectClassName}
              disabled={isLoading || users.length === 0}
            >
              <option value="">Tous les utilisateurs</option>
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="space-y-1">
            <CardTitle>Résultats</CardTitle>
            <CardDescription>
              {isLoading
                ? "Chargement des éléments…"
                : hasActiveFilters(criteria)
                  ? `${filteredElements.length} élément(s) sur ${elements.length}`
                  : `${elements.length} élément(s) actif(s)`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-4 py-3.5">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 flex-1 max-w-xs" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : elements.length === 0 ? (
            <EmptyState
              icon={Database}
              title="Aucun élément"
              description="Aucun élément actif trouvé dans GLPI."
            />
          ) : filteredElements.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description="Aucun élément ne correspond aux critères sélectionnés."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCriteria(EMPTY_ELEMENT_SEARCH)}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    N° inventaire
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Localisation
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Fabricant
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Modèle</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Utilisateur
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredElements.map((element) => (
                  <TableRow key={`${element.itemType}-${element.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{element.id}
                    </TableCell>
                    <TableCell className="text-sm">
                      {element.itemTypeLabel}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium lg:max-w-xs">
                      {element.name || "—"}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {element.inventoryNumber || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {resolveElementRef(element.status)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {resolveElementRef(element.location)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {resolveElementRef(element.manufacturer)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                      {resolveElementRef(element.model)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                      {resolveElementRef(element.user)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
