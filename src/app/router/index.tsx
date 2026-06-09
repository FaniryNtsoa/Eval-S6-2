import { createBrowserRouter } from "react-router-dom"

import { AdminLayout } from "@/app/layouts/AdminLayout"
import { PublicLayout } from "@/app/layouts/PublicLayout"
import { GuestAdminAuth } from "@/modules/auth/guards/GuestAdminAuth"
import { RequireAdminAuth } from "@/modules/auth/guards/RequireAdminAuth"
import { Login } from "@/pages/admin/auth/Login"
import { DashboardPage } from "@/pages/admin/dashboard/DashboardPage"
import { UnifiedImportPage } from "@/pages/admin/import/UnifiedImportPage"
import { ResetDataPage } from "@/pages/admin/reset/ResetDataPage"
import { TicketsPage } from "@/pages/admin/tickets/TicketsPage"
import { ElementsPage } from "@/pages/public/elements/ElementsPage"
import { HomePage } from "@/pages/public/home/HomePage"
import { TicketsKanbanPage } from "@/pages/public/tickets/TicketsKanbanPage"
import { ROUTES } from "@/shared/constants/routes"

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: ROUTES.home,
        element: <HomePage />,
      },
      {
        path: ROUTES.elements,
        element: <ElementsPage />,
      },
      {
        path: ROUTES.tickets,
        element: <TicketsKanbanPage />,
      },
    ],
  },
  {
    path: ROUTES.admin.root,
    children: [
      {
        element: <GuestAdminAuth />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      {
        element: <RequireAdminAuth />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
              {
                path: "tickets",
                element: <TicketsPage />,
              },
              {
                path: "import",
                element: <UnifiedImportPage />,
              },
              {
                path: "reset",
                element: <ResetDataPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
