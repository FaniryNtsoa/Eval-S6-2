import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthStore } from "@/services/stores/authStore"
import { ROUTES } from "@/shared/constants/routes"

export function RequireAdminAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const checkSession = useAuthStore((state) => state.checkSession)
  const location = useLocation()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.admin.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <Outlet />
}
