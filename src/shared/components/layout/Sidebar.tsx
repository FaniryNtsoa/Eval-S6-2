import { NavLink } from "react-router-dom"

import { cn } from "@/shared/lib/utils"
import { ROUTES } from "@/shared/constants/routes"

const navItems = [
  { to: ROUTES.admin.dashboard, label: "Tableau de bord" },
]

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-muted/20">
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
    </aside>
  )
}
