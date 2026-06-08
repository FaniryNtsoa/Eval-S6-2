import { Link } from "react-router-dom"
import { ArrowRight, RotateCcw, Upload } from "lucide-react"

import { AdminPageHeader } from "@/shared/components/layout/admin/AdminPageHeader"
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

const quickActions = [
  {
    title: "Import de données",
    description:
      "Importez actifs, tickets et coûts depuis des fichiers CSV vers GLPI en une seule opération.",
    href: `${ROUTES.admin.import}?new=1`,
    icon: Upload,
    cta: "Lancer l'import",
  },
  {
    title: "Réinitialisation",
    description:
      "Supprimez toutes les données gérées par les imports de l'application, quelle que soit leur origine.",
    href: `${ROUTES.admin.resetData}?new=1`,
    icon: RotateCcw,
    cta: "Gérer les données",
    variant: "outline" as const,
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Tableau de bord"
        description="Zone d'administration — importez et gérez les données GLPI."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card key={action.href} className="shadow-none">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">À propos</CardTitle>
          <CardDescription>
            Cette interface permet de synchroniser vos données CSV avec une
            instance GLPI. Les opérations sont journalisées et un rollback
            automatique est disponible en cas d&apos;échec d&apos;import.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Commencez par préparer vos trois fichiers CSV, puis lancez l&apos;import
          depuis la section dédiée.
        </CardContent>
      </Card>
    </div>
  )
}
