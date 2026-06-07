import { DEFAULT_ADMIN_CODE } from "@/modules/auth/constants"

export const env = {
  glpiApiUrl:
    import.meta.env.VITE_GLPI_API_URL ??
    "http://glpi.localhost/api.php/v2.3",
  glpiTokenUrl:
    import.meta.env.VITE_GLPI_TOKEN_URL ??
    "http://glpi.localhost/api.php/token",
  glpiClientId: import.meta.env.VITE_GLPI_CLIENT_ID ?? "",
  glpiClientSecret: import.meta.env.VITE_GLPI_CLIENT_SECRET ?? "",
  glpiUsername: import.meta.env.VITE_GLPI_USERNAME ?? "",
  glpiPassword: import.meta.env.VITE_GLPI_PASSWORD ?? "",
  adminCode: import.meta.env.VITE_ADMIN_CODE ?? DEFAULT_ADMIN_CODE,
} as const
