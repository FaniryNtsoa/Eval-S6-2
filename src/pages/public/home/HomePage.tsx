import { Link } from "react-router-dom"
import { ArrowRight, Database, Plus, Shield, Upload } from "lucide-react"

import { useCreateTicketModal } from "@/modules/assistance/context/CreateTicketModalContext"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { APP_CONFIG } from "@/shared/constants/config"
import { ROUTES } from "@/shared/constants/routes"

const features = [
  {
    icon: Database,
    title: "Gestion GLPI",
    description:
      "Centralisez la consultation des actifs et tickets depuis une interface moderne.",
  },
  {
    icon: Upload,
    title: "Import CSV",
    description:
      "Synchronisez actifs, tickets et coûts en une seule opération d'import.",
  },
  {
    icon: Shield,
    title: "Administration sécurisée",
    description:
      "Accédez au backoffice via un espace d'administration dédié et protégé.",
  },
]

export function HomePage() {
  const { openCreateTicket } = useCreateTicketModal()

  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary/8 via-background to-muted/40 px-6 py-14 text-center md:px-12 md:py-20">
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Application React · GLPI
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Bienvenue sur {APP_CONFIG.name}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Interface moderne pour piloter vos données GLPI, consulter les
              tickets et gérer les imports depuis un backoffice unifié.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2" onClick={openCreateTicket}>
              <Plus className="size-4" />
              Créer un ticket
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to={ROUTES.elements}>
                Consulter les éléments
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to={ROUTES.admin.dashboard}>Administration</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="transition-colors hover:bg-muted/20"
          >
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-4" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}
