import { Link } from "react-router-dom"

import { APP_CONFIG } from "@/shared/constants/config"
import { ROUTES } from "@/shared/constants/routes"

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to={ROUTES.home} className="text-lg font-semibold">
          {APP_CONFIG.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to={ROUTES.home} className="hover:text-primary">
            Accueil
          </Link>
          <Link to={ROUTES.admin.dashboard} className="hover:text-primary">
            Administration
          </Link>
        </nav>
      </div>
    </header>
  )
}
