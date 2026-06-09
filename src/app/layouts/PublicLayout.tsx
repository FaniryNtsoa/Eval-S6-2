import { Link, Outlet, useLocation } from "react-router-dom"
import { ExternalLink, X } from "lucide-react"

import {
  CreateTicketModalProvider,
  useCreateTicketModal,
} from "@/modules/assistance/context/CreateTicketModalContext"
import { Footer } from "@/shared/components/layout/Footer"
import { PublicSidebar } from "@/shared/components/layout/PublicSidebar"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"
import { ROUTES } from "@/shared/constants/routes"

const pageTitles: Record<string, string> = {
  [ROUTES.home]: "Accueil",
  [ROUTES.tickets]: "Tickets",
  [ROUTES.elements]: "Éléments",
}

function PublicSuccessBanner() {
  const { lastSuccess, clearSuccess } = useCreateTicketModal()

  if (!lastSuccess) {
    return null
  }

  return (
    <Alert className="mb-6">
      <AlertTitle>Ticket créé</AlertTitle>
      <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Le ticket <span className="font-mono">#{lastSuccess.ticketId}</span> a
          été créé avec succès.
          {lastSuccess.warnings.length > 0 && (
            <span className="mt-1 block text-sm">
              Avec des avertissements : {lastSuccess.warnings.join(" · ")}
            </span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="self-end sm:self-auto"
          onClick={clearSuccess}
        >
          <X className="size-4" />
          Fermer
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function PublicLayoutContent() {
  const location = useLocation()
  // const { openCreateTicket } = useCreateTicketModal()
  const pageTitle = pageTitles[location.pathname] ?? "Espace public"
  const isKanbanPage = location.pathname === ROUTES.tickets

  return (
    <SidebarProvider>
      <PublicSidebar />
      <SidebarInset className="bg-linear-to-b from-muted/40 to-background">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {pageTitle}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {/* <Button variant="default" size="sm" onClick={openCreateTicket}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">
                {isKanbanPage ? "Ajouter 1 ticket" : "Créer un ticket"}
              </span>
            </Button> */}
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={ROUTES.admin.dashboard}
                className="gap-1.5 text-muted-foreground"
              >
                Admin
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <div
            className={
              isKanbanPage
                ? "mx-auto w-full max-w-[1400px] flex-1"
                : "mx-auto w-full max-w-6xl flex-1"
            }
          >
            <PublicSuccessBanner />
            <Outlet />
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function PublicLayout() {
  return (
    <CreateTicketModalProvider>
      <PublicLayoutContent />
    </CreateTicketModalProvider>
  )
}
