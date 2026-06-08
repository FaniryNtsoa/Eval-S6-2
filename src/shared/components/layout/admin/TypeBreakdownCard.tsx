import { Box, type LucideIcon } from "lucide-react"

import type { TypeCount } from "@/modules/dashboard/types/dashboard.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface TypeBreakdownCardProps {
  title: string
  description: string
  total: number
  items: TypeCount[]
  icon?: LucideIcon
  isLoading?: boolean
  emptyMessage?: string
}

export function TypeBreakdownCard({
  title,
  description,
  total,
  items,
  icon: Icon = Box,
  isLoading,
  emptyMessage = "Aucune donnée",
}: TypeBreakdownCardProps) {
  const visibleItems = items.filter((item) => item.count > 0 || item.error)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-3xl font-semibold tabular-nums",
                isLoading && "text-muted-foreground",
              )}
            >
              {isLoading ? "…" : total}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-8 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {visibleItems.map((item) => {
              const share = total > 0 ? Math.round((item.count / total) * 100) : 0

              return (
                <li
                  key={item.type}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    {item.error && (
                      <p className="truncate text-xs text-destructive">
                        {item.error}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {total > 0 && !item.error && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {share}%
                      </span>
                    )}
                    <span className="min-w-8 text-right text-sm font-semibold tabular-nums">
                      {item.error ? "—" : item.count}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
