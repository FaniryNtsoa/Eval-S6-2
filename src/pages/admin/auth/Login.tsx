import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { DEFAULT_ADMIN_CODE } from "@/modules/auth/constants"
import { useAuthStore } from "@/services/stores/authStore"
import { Button } from "@/shared/components/ui/button"
import { ROUTES } from "@/shared/constants/routes"

export function Login() {
  const [code, setCode] = useState(DEFAULT_ADMIN_CODE)
  const [error, setError] = useState<string | null>(null)
  const  login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.admin.dashboard

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    const success = await login(code)
    setIsLoading(false)

    if (success) {
      navigate(redirectTo, { replace: true })
      return
    }

    setError(
      "Connexion impossible. Vérifiez le code d'accès ou la configuration GLPI.",
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Accès backoffice
          </h1>
          <p className="text-sm text-muted-foreground">
            Saisissez le code d&apos;accès pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-code" className="text-sm font-medium">
              Code d&apos;accès
            </label>
            <input
              id="admin-code"
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Accéder au backoffice"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link to={ROUTES.home} className="hover:text-primary">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
