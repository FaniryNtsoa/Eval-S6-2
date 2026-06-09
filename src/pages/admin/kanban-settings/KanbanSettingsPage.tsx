import { useEffect, useState } from "react"
import { Loader2, Palette, Save } from "lucide-react"

import { KANBAN_STATUSES } from "@/modules/assistance/constants/kanban"
import { KANBAN_STATUS_LABELS_FR } from "@/modules/kanban-config/constants/defaults"
import { useKanbanConfig } from "@/modules/kanban-config/hooks/useKanbanConfig"
import type { UpdateKanbanColumnInput } from "@/modules/kanban-config/types/kanban-config.types"
import { formatBilingualLabel } from "@/modules/kanban-config/utils/color"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
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

type ColumnFormState = Record<number, UpdateKanbanColumnInput>

function buildFormState(
  columns: ReturnType<typeof useKanbanConfig>["config"]["columns"],
): ColumnFormState {
  return Object.fromEntries(
    columns.map((column) => [
      column.statusId,
      {
        statusId: column.statusId,
        labelMg: column.labelMg,
        backgroundColor: column.backgroundColor,
      },
    ]),
  )
}

export function KanbanSettingsPage() {
  const { config, isLoading, isSaving, error, save } = useKanbanConfig()
  const [formState, setFormState] = useState<ColumnFormState>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setFormState(buildFormState(config.columns))
    }
  }, [config.columns, isLoading])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)

    const columns = KANBAN_STATUSES.map((statusId) => formState[statusId]).filter(
      Boolean,
    )

    const saved = await save({ columns })

    if (saved) {
      setSuccessMessage("Configuration Kanban enregistrée.")
    }
  }

  const updateColumn = (
    statusId: number,
    patch: Partial<UpdateKanbanColumnInput>,
  ) => {
    setFormState((current) => ({
      ...current,
      [statusId]: {
        ...current[statusId],
        ...patch,
      },
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Personnalisation Kanban"
        description="Modifiez les couleurs de fond et les libellés malgaches des colonnes du tableau public."
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <AlertTitle>Enregistré</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {KANBAN_STATUSES.map((statusId) => {
          const column = formState[statusId]
          const labelFr = KANBAN_STATUS_LABELS_FR[statusId]

          return (
            <Card key={statusId}>
              <CardHeader>
                <CardTitle className="text-base">
                  Colonne {statusId} · {labelFr}
                </CardTitle>
                <CardDescription>
                  Aperçu du libellé :{" "}
                  {column
                    ? formatBilingualLabel(column.labelMg, labelFr)
                    : labelFr}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`label-mg-${statusId}`}>
                    Libellé malgache
                  </Label>
                  <Input
                    id={`label-mg-${statusId}`}
                    value={column?.labelMg ?? ""}
                    disabled={isLoading || isSaving}
                    onChange={(event) =>
                      updateColumn(statusId, { labelMg: event.target.value })
                    }
                    placeholder="Ex. Vaovao"
                  />
                  <p className="text-xs text-muted-foreground">
                    Français (fixe) : {labelFr}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`color-${statusId}`}>
                    Couleur de fond (header &amp; body)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id={`color-${statusId}`}
                      type="color"
                      value={column?.backgroundColor ?? "#E0F2FE"}
                      disabled={isLoading || isSaving}
                      className="h-11 w-16 cursor-pointer p-1"
                      onChange={(event) =>
                        updateColumn(statusId, {
                          backgroundColor: event.target.value.toUpperCase(),
                        })
                      }
                    />
                    <Input
                      value={column?.backgroundColor ?? ""}
                      disabled={isLoading || isSaving}
                      className="font-mono uppercase"
                      onChange={(event) =>
                        updateColumn(statusId, {
                          backgroundColor: event.target.value.toUpperCase(),
                        })
                      }
                      placeholder="#E0F2FE"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" />
            Aperçu rapide
          </CardTitle>
          <CardDescription>
            Les couleurs et libellés seront visibles sur le kanban public après
            rechargement de la page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {KANBAN_STATUSES.map((statusId) => {
            const column = formState[statusId]
            const labelFr = KANBAN_STATUS_LABELS_FR[statusId]

            return (
              <div
                key={statusId}
                className="min-w-[180px] flex-1 rounded-xl border px-4 py-3"
                style={{ backgroundColor: column?.backgroundColor }}
              >
                <p className="text-sm font-semibold">
                  {column
                    ? formatBilingualLabel(column.labelMg, labelFr)
                    : labelFr}
                </p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
