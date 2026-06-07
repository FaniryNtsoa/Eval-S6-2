import { Outlet } from "react-router-dom"

import { Header } from "@/shared/components/layout/Header"
import { Sidebar } from "@/shared/components/layout/Sidebar"

export function AdminLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
