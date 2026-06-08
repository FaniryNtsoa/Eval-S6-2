import { DEFAULT_ADMIN_CODE } from "@/modules/auth/constants"

const devGlpiDefaults = {
  glpiApiUrl: "/api/glpi/v2.3",
  glpiTokenUrl: "/api/glpi/token",
} as const

const prodGlpiDefaults = {
  glpiApiUrl: "http://glpi.localhost/api.php/v2.3",
  glpiTokenUrl: "http://glpi.localhost/api.php/token",
} as const

const glpiDefaults = import.meta.env.DEV ? devGlpiDefaults : prodGlpiDefaults

export const env = {
  glpiApiUrl: import.meta.env.VITE_GLPI_API_URL ?? glpiDefaults.glpiApiUrl,
  glpiTokenUrl:
    import.meta.env.VITE_GLPI_TOKEN_URL ?? glpiDefaults.glpiTokenUrl,
  glpiClientId: import.meta.env.VITE_GLPI_CLIENT_ID ?? "",
  glpiClientSecret: import.meta.env.VITE_GLPI_CLIENT_SECRET ?? "",
  glpiUsername: import.meta.env.VITE_GLPI_USERNAME ?? "",
  glpiPassword: import.meta.env.VITE_GLPI_PASSWORD ?? "",
  adminCode: import.meta.env.VITE_ADMIN_CODE ?? DEFAULT_ADMIN_CODE,
  glpiImportUserPassword:
    import.meta.env.VITE_GLPI_IMPORT_USER_PASSWORD ?? "Import123!",
  glpiLegacyApiUrl:
    import.meta.env.VITE_GLPI_LEGACY_API_URL ?? "/api/glpi-legacy",
  glpiAppToken: import.meta.env.VITE_GLPI_APP_TOKEN ?? "",
  glpiUserToken: import.meta.env.VITE_GLPI_USER_TOKEN ?? "",
} as const
