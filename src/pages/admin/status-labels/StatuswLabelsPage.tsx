import { useEffect, useState } from "react"
import { Languages, Loader2, Plus, Save, Trash2 } from "lucide-react"

import { KANBAN_STATUSES } from "@/modules/assistance/constants/kanban"
import {
  KANBAN_FRENCH_LANGUAGE_CODE,
  KANBAN_MALAGASY_LANGUAGE_CODE,
  KANBAN_PROTECTED_LANGUAGE_CODES,
  KANBAN_STATUS_LABELS_FR,
} from "@/modules/kanban-config/constants/defaults"
import { useKanbanConfig } from "@/modules/kanban-config/hooks/useKanbanConfig"
import type {
  KanbanLanguageCode,
  UpdateKanbanColumnInput,
} from "@/modules/kanban-config/types/kanban-config.types"
import { resolveColumnLabel } from "@/modules/kanban-config/utils/config"
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

type LabelFormState = Record<number, Record<KanbanLanguageCode, string>>

function buildLabelFormState(
  columns: ReturnType<typeof useKanbanConfig>["config"]["columns"],
): LabelFormState {
  return Object.fromEntries(
    columns.map((column) => [column.statusId, { ...column.labels }]),
  )
}

function getDefaultEditableLanguage(
  languages: ReturnType<typeof useKanbanConfig>["config"]["languages"],
): KanbanLanguageCode {
  return (
    languages.find(
      (language) => !KANBAN_PROTECTED_LANGUAGE_CODES.has(language.code),
    )?.code ??
    languages.find((language) => language.code === KANBAN_MALAGASY_LANGUAGE_CODE)
      ?.code ??
    KANBAN_MALAGASY_LANGUAGE_CODE
  )
}

export function StatusLabelsPage() {
  const { config, isLoading, isSaving, error, save, addLanguage, removeLanguage } =
    useKanbanConfig()
  const [formState, setFormState] = useState<LabelFormState>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<KanbanLanguageCode>(
    KANBAN_MALAGASY_LANGUAGE_CODE,
  )
  const [newLanguageCode, setNewLanguageCode] = useState("")
  const [newLanguageName, setNewLanguageName] = useState("")

  useEffect(() => {
    if (!isLoading) {
      setFormState(buildLabelFormState(config.columns))
    }
  }, [config.columns, isLoading])

  useEffect(() => {
    if (
      config.languages.length > 0 &&
      !config.languages.some((language) => language.code === selectedLanguage)
    ) {
      setSelectedLanguage(getDefaultEditableLanguage(config.languages))
    }
  }, [config.languages, selectedLanguage])

  const editableLanguages = config.languages.filter(
    (language) => language.code !== KANBAN_FRENCH_LANGUAGE_CODE,
  )

  const removableLanguages = config.languages.filter(
    (language) => !KANBAN_PROTECTED_LANGUAGE_CODES.has(language.code),
  )

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
          backgroundColor: existing?.backgroundColor ?? "#E0F2FE",
          labels: {
            ...(existing?.labels ?? {}),
            ...(formState[statusId] ?? {}),
          },
        }
      },
    )

    const saved = await save({ columns })

    if (saved) {
      setSuccessMessage("Libellés enregistrés.")
    }
  }

  const handleAddLanguage = async () => {
    setSuccessMessage(null)

    const saved = await addLanguage({
      code: newLanguageCode.trim(),
      name: newLanguageName.trim(),
    })

    if (saved) {
      const code = newLanguageCode.trim().toLowerCase()
      setNewLanguageCode("")
      setNewLanguageName("")
      setSelectedLanguage(code)
      setSuccessMessage("Langue ajoutée. Une colonne SQLite a été créée.")
    }
  }

  const handleRemoveLanguage = async (code: KanbanLanguageCode) => {
    const language = config.languages.find((item) => item.code === code)
    const confirmed = window.confirm(
      `Supprimer la langue « ${language?.name ?? code} » ? La colonne SQLite associée sera supprimée.`,
    )

    if (!confirmed) {
      return
    }

    setSuccessMessage(null)

    const saved = await removeLanguage(code)

    if (saved) {
      setSelectedLanguage(getDefaultEditableLanguage(config.languages))
      setSuccessMessage("Langue supprimée.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Libellés des statuts Kanban"
        description="Gérez les traductions des en-têtes de colonnes. Sur le kanban public, une seule langue est affichée à la fois via un sélecteur."
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Langues disponibles</CardTitle>
          <CardDescription>
            Français et malgache sont protégés. Les autres langues peuvent être
            supprimées (colonne SQLite incluse).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {config.languages.map((language) => {
              const isProtected = KANBAN_PROTECTED_LANGUAGE_CODES.has(
                language.code,
              )

              return (
                <li
                  key={language.code}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{language.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {language.code}
                      {isProtected ? " · protégée" : ""}
                    </p>
                  </div>
                  {!isProtected && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading || isSaving}
                      onClick={() => void handleRemoveLanguage(language.code)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                      Supprimer
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="new-language-code">Nouveau code</Label>
              <Input
                id="new-language-code"
                value={newLanguageCode}
                disabled={isLoading || isSaving}
                onChange={(event) => setNewLanguageCode(event.target.value)}
                placeholder="Ex. en"
                className="max-w-[120px] font-mono lowercase"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-language-name">Nom affiché</Label>
              <Input
                id="new-language-name"
                value={newLanguageName}
                disabled={isLoading || isSaving}
                onChange={(event) => setNewLanguageName(event.target.value)}
                placeholder="Ex. English"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={
                isLoading ||
                isSaving ||
                !newLanguageCode.trim() ||
                !newLanguageName.trim()
              }
              onClick={() => void handleAddLanguage()}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Label htmlFor="edit-language">Langue à modifier</Label>
            <select
              id="edit-language"
              value={selectedLanguage}
              disabled={isLoading || isSaving || editableLanguages.length === 0}
              onChange={(event) => setSelectedLanguage(event.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {editableLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            Le français est fixe et sert de référence.
          </p>
        </div>

        {KANBAN_STATUSES.map((statusId) => {
          const labelFr = KANBAN_STATUS_LABELS_FR[statusId]
          const label = formState[statusId]?.[selectedLanguage] ?? ""

          return (
            <Card key={statusId}>
              <CardHeader>
                <CardTitle className="text-base">
                  Statut {statusId} · {labelFr}
                </CardTitle>
                <CardDescription>
                  Aperçu :{" "}
                  {resolveColumnLabel(
                    {
                      statusId,
                      backgroundColor: "#fff",
                      labels: {
                        ...(config.columns.find(
                          (column) => column.statusId === statusId,
                        )?.labels ?? {}),
                        ...(formState[statusId] ?? {}),
                      },
                    },
                    selectedLanguage,
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-md">
                <div className="space-y-2">
                  <Label htmlFor={`label-${selectedLanguage}-${statusId}`}>
                    Libellé (
                    {config.languages.find(
                      (language) => language.code === selectedLanguage,
                    )?.name ?? selectedLanguage}
                    )
                  </Label>
                  <Input
                    id={`label-${selectedLanguage}-${statusId}`}
                    value={label}
                    disabled={isLoading || isSaving}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        [statusId]: {
                          ...(current[statusId] ?? {}),
                          [selectedLanguage]: event.target.value,
                        },
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
            Une seule langue affichée à la fois dans les en-têtes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-language">Langue d&apos;aperçu</Label>
            <select
              id="preview-language"
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)}
              className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {config.languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            {KANBAN_STATUSES.map((statusId) => (
              <div
                key={statusId}
                className="min-w-[180px] flex-1 rounded-xl border px-4 py-3"
              >
                <p className="text-sm font-semibold">
                  {resolveColumnLabel(
                    {
                      statusId,
                      backgroundColor: "#fff",
                      labels: {
                        ...(config.columns.find(
                          (column) => column.statusId === statusId,
                        )?.labels ?? {}),
                        ...(formState[statusId] ?? {}),
                      },
                    },
                    selectedLanguage,
                  )}
                </p>
              </div>
            ))}
          </div>
          {removableLanguages.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Langues supprimables :{" "}
              {removableLanguages.map((language) => language.name).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
