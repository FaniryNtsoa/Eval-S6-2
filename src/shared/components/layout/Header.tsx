import { Link, useLocation } from "react-router-dom"
import { Plus } from "lucide-react"

import { useCreateTicketModal } from "@/modules/assistance/context/CreateTicketModalContext"
import { Button } from "@/shared/components/ui/button"
import { APP_CONFIG } from "@/shared/constants/config"
import { ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

const navLinks = [
  { to: ROUTES.home, label: "Accueil" },
  { to: ROUTES.elements, label: "Éléments" },
  { to: ROUTES.admin.dashboard, label: "Administration" },
]

export function Header() {
  const location = useLocation()
  const { openCreateTicket } = useCreateTicketModal()

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          to={ROUTES.home}
          className="text-lg font-semibold tracking-tight transition-colors hover:text-primary"
        >
          {APP_CONFIG.name}
        </Link>
        <nav className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            className="mr-1"
            onClick={openCreateTicket}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Créer un ticket</span>
          </Button>
          {navLinks.map((link) => {
            const isActive =
              link.to === ROUTES.home
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to)

            return (
              <Button
                key={link.to}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-muted-foreground",
                  isActive && "bg-muted text-foreground",
                )}
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
