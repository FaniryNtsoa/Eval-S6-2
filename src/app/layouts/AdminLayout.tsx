import { Link, Outlet, useLocation } from "react-router-dom"
import { ExternalLink } from "lucide-react"

import { AdminSidebar } from "@/shared/components/layout/Sidebar"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"
import { ROUTES } from "@/shared/constants/routes"

const pageTitles: Record<string, string> = {
  [ROUTES.admin.dashboard]: "Tableau de bord",
  [ROUTES.admin.tickets]: "Tickets",
  [ROUTES.admin.import]: "Import GLPI",
  [ROUTES.admin.resetData]: "Réinitialisation",
  [ROUTES.admin.kanbanSettings]: "Personnalisation Kanban",
  [ROUTES.admin.statusLabels]: "Libellés de statut",
}

export function AdminLayout() {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] ?? "Administration"

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-linear-to-b from-muted/50 to-background">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {pageTitle}
          </span>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.home} className="gap-1.5 text-muted-foreground">
                Site public
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl flex-1">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
