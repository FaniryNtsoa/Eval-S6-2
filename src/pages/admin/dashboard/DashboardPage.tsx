import { Link } from "react-router-dom"

import { Button } from "@/shared/components/ui/button"
import { ROUTES } from "@/shared/constants/routes"

export function DashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Zone d&apos;administration — importez et gérez les données GLPI.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        <h2 className="font-medium">Import de données</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Importez actifs, tickets et coûts depuis des fichiers CSV vers GLPI.
        </p>
        <Button asChild className="mt-4">
          <Link to={ROUTES.admin.import}>Lancer l&apos;import</Link>
        </Button>
      </div>
    </section>
  )
}
