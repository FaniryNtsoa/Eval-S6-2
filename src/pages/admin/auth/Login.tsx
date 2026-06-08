import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Database, Lock } from "lucide-react"

import { DEFAULT_ADMIN_CODE } from "@/modules/auth/constants"
import { useAuthStore } from "@/services/stores/authStore"
import { APP_CONFIG } from "@/shared/constants/config"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ROUTES } from "@/shared/constants/routes"

export function Login() {
  const [code, setCode] = useState(DEFAULT_ADMIN_CODE)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((state) => state.login)
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-muted/50 to-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Database className="size-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {APP_CONFIG.name}
            </h1>
            <p className="text-sm text-muted-foreground">Espace administration</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="size-4 text-muted-foreground" />
              Connexion
            </CardTitle>
            <CardDescription>
              Saisissez le code d&apos;accès pour continuer.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-code">Code d&apos;accès</Label>
                <Input
                  id="admin-code"
                  type="password"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  autoComplete="off"
                  aria-invalid={!!error}
                  className="h-10"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion en cours…" : "Accéder au backoffice"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-0 bg-transparent pt-0">
            <Button variant="link" size="sm" asChild>
              <Link to={ROUTES.home}>Retour à l&apos;accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
