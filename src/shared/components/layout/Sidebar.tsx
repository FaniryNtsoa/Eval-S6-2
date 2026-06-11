import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  Database,
  Languages,
  LayoutDashboard,
  LogOut,
  Palette,
  RotateCcw,
  Ticket,
  Upload,
} from "lucide-react"

import { useAuthStore } from "@/services/stores/authStore"
import { APP_CONFIG } from "@/shared/constants/config"
import { ROUTES } from "@/shared/constants/routes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar"

const navItems = [
  { to: ROUTES.admin.dashboard, label: "Tableau de bord", icon: LayoutDashboard },
  { to: ROUTES.admin.tickets, label: "Tickets", icon: Ticket },
  { to: ROUTES.admin.import, label: "Import", icon: Upload },
  {
    to: ROUTES.admin.kanbanSettings,
    label: "Kanban",
    icon: Palette,
  },
  { to: ROUTES.admin.statusLabels, label: "Libellés MG", icon: Languages },
  { to: ROUTES.admin.resetData, label: "Réinitialiser", icon: RotateCcw },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.admin.login, { replace: true })
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none"
              tooltip={APP_CONFIG.name}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Database className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{APP_CONFIG.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  Administration
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.to

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Déconnexion"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
