import type { KanbanLanguage } from "@/modules/kanban-config/types/kanban-config.types"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

interface KanbanLanguageSelectorProps {
  languages: KanbanLanguage[]
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  className?: string
}

export function KanbanLanguageSelector({
  languages,
  value,
  onChange,
  disabled = false,
  className,
}: KanbanLanguageSelectorProps) {
  if (languages.length <= 1) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor="kanban-display-language" className="shrink-0 text-sm">
        Langue
      </Label>
      <select
        id="kanban-display-language"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  )
}
