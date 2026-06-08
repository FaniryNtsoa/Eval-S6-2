import type { ReactNode } from "react"

import { TooltipProvider } from "@/shared/components/ui/tooltip"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
}
