import { NavLink, useNavigate } from "react-router-dom"

import { useAuthStore } from "@/services/stores/authStore"
import { Button } from "@/shared/components/ui/button"
import { ROUTES } from "@/shared/constants/routes"
import { cn } from "@/shared/lib/utils"

const navItems = [
  { to: ROUTES.admin.dashboard, label: "Tableau de bord" },
  { to: ROUTES.admin.import, label: "Import" },
  { to: ROUTES.admin.resetData, label: "Réinitialiser" },
]

export function Sidebar() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.admin.login, { replace: true })
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/20">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-border p-4">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
