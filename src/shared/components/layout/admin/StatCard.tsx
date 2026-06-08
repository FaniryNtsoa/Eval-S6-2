import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  icon?: LucideIcon
  tone?: "default" | "success" | "info" | "danger"
}

const toneStyles = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-blue-600 dark:text-blue-400",
  danger: "text-destructive",
}

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card size="sm" className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </CardTitle>
        {Icon && (
          <Icon className="size-4 text-muted-foreground/60" aria-hidden />
        )}
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-semibold tabular-nums", toneStyles[tone])}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
