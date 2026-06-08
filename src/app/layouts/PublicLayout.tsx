import { Outlet } from "react-router-dom"
import { X } from "lucide-react"

import {
  CreateTicketModalProvider,
  useCreateTicketModal,
} from "@/modules/assistance/context/CreateTicketModalContext"
import { Footer } from "@/shared/components/layout/Footer"
import { Header } from "@/shared/components/layout/Header"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"

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
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <PublicSuccessBanner />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function PublicLayout() {
  return (
    <CreateTicketModalProvider>
      <PublicLayoutContent />
    </CreateTicketModalProvider>
  )
}
