import { useEffect, useState } from "react"
import { Languages, Loader2, Save } from "lucide-react"

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

type LabelFormState = Record<number, string>

function buildLabelFormState(
  columns: ReturnType<typeof useKanbanConfig>["config"]["columns"],
): LabelFormState {
  return Object.fromEntries(
    columns.map((column) => [column.statusId, column.labelMg]),
  )
}

export function StatusLabelsPage() {
  const { config, isLoading, isSaving, error, save } = useKanbanConfig()
  const [formState, setFormState] = useState<LabelFormState>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setFormState(buildLabelFormState(config.columns))
    }
  }, [config.columns, isLoading])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)

    const columns: UpdateKanbanColumnInput[] = KANBAN_STATUSES.map(
      (statusId) => {
        const existing = config.columns.find(
          (column) => column.statusId === statusId,
        )

        return {
          statusId,
          labelMg: formState[statusId]?.trim() ?? "",
          backgroundColor: existing?.backgroundColor ?? "#E0F2FE",
        }
      },
    )

    const saved = await save({ columns })

    if (saved) {
      setSuccessMessage("Libellés malgaches enregistrés.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Libellés malgaches des statuts"
        description="Modifiez la version malgache des 3 statuts affichés sur le kanban public (Nouveau, In progress, Terminé)."
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
          const labelFr = KANBAN_STATUS_LABELS_FR[statusId]
          const labelMg = formState[statusId] ?? ""

          return (
            <Card key={statusId}>
              <CardHeader>
                <CardTitle className="text-base">
                  Statut {statusId} · {labelFr}
                </CardTitle>
                <CardDescription>
                  Aperçu : {formatBilingualLabel(labelMg, labelFr)}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-md">
                <div className="space-y-2">
                  <Label htmlFor={`label-mg-${statusId}`}>
                    Libellé malgache
                  </Label>
                  <Input
                    id={`label-mg-${statusId}`}
                    value={labelMg}
                    disabled={isLoading || isSaving}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        [statusId]: event.target.value,
                      }))
                    }
                    placeholder={
                      statusId === 1
                        ? "Ex. Vaovao"
                        : statusId === 2
                          ? "Ex. Efa manao"
                          : "Ex. Vita"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Français (fixe) : {labelFr}
                  </p>
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
            <Languages className="size-4" />
            Aperçu sur le kanban
          </CardTitle>
          <CardDescription>
            Format affiché : Malgache / Français
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {KANBAN_STATUSES.map((statusId) => {
            const labelFr = KANBAN_STATUS_LABELS_FR[statusId]

            return (
              <div
                key={statusId}
                className="min-w-[180px] flex-1 rounded-xl border px-4 py-3"
              >
                <p className="text-sm font-semibold">
                  {formatBilingualLabel(formState[statusId] ?? "", labelFr)}
                </p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}