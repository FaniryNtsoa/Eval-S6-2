export const ROUTES = {
  home: "/",
  elements: "/elements",
  tickets: "/tickets",
  costs: "/costs",
  admin: {
    root: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    tickets: "/admin/tickets",
    import: "/admin/import",
    resetData: "/admin/reset",
    kanbanSettings: "/admin/kanban-settings",
    statusLabels: "/admin/status-labels",
  },
} as const
