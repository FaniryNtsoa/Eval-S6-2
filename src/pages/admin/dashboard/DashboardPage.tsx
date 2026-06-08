import { Link } from "react-router-dom"
import {
  ArrowRight,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Ticket,
  Upload,
} from "lucide-react"

import { useDashboardStats } from "@/modules/dashboard/hooks/useDashboardStats"
import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
import { TypeBreakdownCard } from "@/shared/components/layout/admin/TypeBreakdownCard"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

const quickActions = [
  {
    title: "Import de données",
    description: "Synchroniser actifs, tickets et coûts depuis des CSV.",
    href: `${ROUTES.admin.import}?new=1`,
    icon: Upload,
    cta: "Lancer l'import",
  },
  {
    title: "Réinitialisation",
    description: "Supprimer les données gérées par les imports.",
    href: `${ROUTES.admin.resetData}?new=1`,
    icon: RotateCcw,
    cta: "Gérer les données",
    variant: "outline" as const,
  },
]

export function DashboardPage() {
  const { stats, isLoading, error, refresh } = useDashboardStats()

  return (
    <div className="page-shell">
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble des éléments et tickets présents dans GLPI."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </AdminPageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <TypeBreakdownCard
          title="Éléments"
          description="Actifs actifs par type d'équipement"
          total={stats?.assets.total ?? 0}
          items={stats?.assets.byType ?? []}
          icon={HardDrive}
          isLoading={isLoading}
          emptyMessage="Aucun actif importable trouvé"
        />
        <TypeBreakdownCard
          title="Tickets"
          description="Tickets actifs par type (incident, demande…)"
          total={stats?.tickets.total ?? 0}
          items={stats?.tickets.byType ?? []}
          icon={Ticket}
          isLoading={isLoading}
          emptyMessage="Aucun ticket actif"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Tickets GLPI</CardTitle>
            <CardDescription>
              Consulter la liste complète et ouvrir la fiche détaillée de chaque
              ticket.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.admin.tickets} className="gap-1.5">
              Voir les tickets
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card
            key={action.href}
            className="transition-colors hover:bg-muted/15"
          >
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="size-4" />
              </div>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardFooter className="border-0 bg-transparent pt-0">
              <Button variant={action.variant ?? "default"} asChild>
                <Link to={action.href} className="gap-1.5">
                  {action.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {stats && !isLoading && (
        <Card size="sm" className="bg-muted/20">
          <CardContent className="text-xs text-muted-foreground">
            Dernière mise à jour :{" "}
            {new Date(stats.loadedAt).toLocaleString("fr-FR")}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
