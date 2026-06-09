export const ROUTES = {
  home: "/",
  elements: "/elements",
  tickets: "/tickets",
  admin: {
    root: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    tickets: "/admin/tickets",
    import: "/admin/import",
    resetData: "/admin/reset",
  },
} as const
