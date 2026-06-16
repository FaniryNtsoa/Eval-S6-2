import { RefreshCw, Wallet } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useCostAggregation } from "@/modules/costs/hooks/useCostAggregation"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import type { ItemTypeCostRow } from "@/modules/costs/types/cost-aggregation.types"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
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

function formatAmount(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)
}

export function CostsPage() {
  const { rows, isLoading, error, reload } = useCostAggregation()
  const [selectedRow, setSelectedRow] = useState<ItemTypeCostRow | null>(null)
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)
  const grandSupercost = rows.reduce((sum, row) => sum + row.supercost, 0)
  const grandReopen = rows.reduce((sum, row) => sum + row.reopenCost, 0)
  const grandGlpi = rows.reduce((sum, row) => sum + row.glpiCost, 0)


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-4" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Coûts par type d&apos;élément
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Synthèse des coûts GLPI, supercoûts et frais de réouverture locaux,
            répartis équitablement entre les éléments liés à chaque ticket.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void reload()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Supercost (SQLite)</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "—" : formatAmount(grandSupercost)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Frais de réouverture</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "—" : formatAmount(grandReopen)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coût GLPI</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "—" : formatAmount(grandGlpi)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "—" : formatAmount(grandTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par item_type</CardTitle>
          <CardDescription>
            Si un ticket est lié à plusieurs éléments, chaque montant est
            divisé à parts égales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun coût à afficher pour des tickets avec éléments associés.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type d&apos;élément</TableHead>
                    <TableHead className="text-right">Supercost</TableHead>
                    <TableHead className="text-right">Réouverture</TableHead>
                    <TableHead className="text-right">Coût GLPI</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.itemType} className="cursor-poinnter hover:bg-muted/50" onClick={() => setSelectedRow(row)}>
                      <TableCell>
                        <div className="font-medium">{row.itemTypeLabel}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.itemType}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatAmount(row.supercost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatAmount(row.reopenCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatAmount(row.glpiCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        {formatAmount(row.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={selectedRow != null} onOpenChange={(o) => !o && setSelectedRow(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRow?.itemTypeLabel}</DialogTitle>
            <DialogDescription>
              Détail des contributions — total {selectedRow ? formatAmount(selectedRow.total) : ""}
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRow?.details.map((line, i) => (
                <TableRow key={`${line.ticketId}-${line.itemId}-${line.source}-${i}`}>
                  <TableCell className="font-mono text-xs">{line.ticketRef}</TableCell>
                  <TableCell className="font-mono text-xs">{line.itemRef}</TableCell>
                  <TableCell>
                    {line.source === "supercost"
                      ? "Supercost"
                      : line.source === "reopen"
                        ? "Réouverture"
                        : "GLPI"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatAmount(line.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>

  )
}
