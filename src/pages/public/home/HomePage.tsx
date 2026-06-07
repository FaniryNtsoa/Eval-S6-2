import { Link } from "react-router-dom"

import { Button } from "@/shared/components/ui/button"
import { APP_CONFIG } from "@/shared/constants/config"
import { ROUTES } from "@/shared/constants/routes"

export function HomePage() {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Bienvenue sur {APP_CONFIG.name}
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Application React pour la gestion GLPI. La structure du projet est
          prête pour le développement des modules fonctionnels.
        </p>
      </div>
      <Button asChild>
        <Link to={ROUTES.admin.dashboard}>Accéder au backoffice</Link>
      </Button>
    </section>
  )
}
