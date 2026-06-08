import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

const typeStyles: Record<number, string> = {
  1: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300",
  2: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300",
}

const statusStyles: Record<number, string> = {
  1: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300",
  2: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300",
  3: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300",
  4: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300",
  5: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300",
  6: "border-border bg-muted text-muted-foreground",
  10: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300",
}

const priorityStyles: Record<number, string> = {
  1: "border-border bg-muted/60 text-muted-foreground",
  2: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  3: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-300",
  4: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300",
  5: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300",
}

function TicketFieldBadge({
  label,
  styleMap,
  id,
}: {
  label: string
  styleMap: Record<number, string>
  id?: number
}) {
  const style = (id !== undefined && styleMap[id]) || styleMap[0] || ""

  return (
    <Badge variant="outline" className={cn("font-normal", style)}>
      {label}
    </Badge>
  )
}

export function TicketTypeBadge({
  label,
  id,
}: {
  label: string
  id?: number
}) {
  return <TicketFieldBadge label={label} styleMap={typeStyles} id={id} />
}

export function TicketStatusBadge({
  label,
  id,
}: {
  label: string
  id?: number
}) {
  return <TicketFieldBadge label={label} styleMap={statusStyles} id={id} />
}

export function TicketPriorityBadge({
  label,
  id,
}: {
  label: string
  id?: number
}) {
  return <TicketFieldBadge label={label} styleMap={priorityStyles} id={id} />
}
