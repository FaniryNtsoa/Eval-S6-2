import { createBrowserRouter } from "react-router-dom"

import { AdminLayout } from "@/app/layouts/AdminLayout"
import { PublicLayout } from "@/app/layouts/PublicLayout"
import { DashboardPage } from "@/pages/admin/dashboard/DashboardPage"
import { HomePage } from "@/pages/public/home/HomePage"
import { ROUTES } from "@/shared/constants/routes"

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: ROUTES.home,
        element: <HomePage />,
      },
    ],
  },
  {
    path: ROUTES.admin.root,
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
])
