import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "@/services/stores/authStore"
import { ROUTES } from "@/shared/constants/routes"

export function GuestAdminAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.admin.dashboard} replace />
  }

  return <Outlet />
}
