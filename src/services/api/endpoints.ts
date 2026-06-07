export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  tickets: {
    list: "/tickets",
    detail: (id: string | number) => `/tickets/${id}`,
  },
} as const
