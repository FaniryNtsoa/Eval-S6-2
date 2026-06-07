import { APP_CONFIG } from "@/shared/constants/config"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-center px-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_CONFIG.name}
      </div>
    </footer>
  )
}
