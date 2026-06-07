import { env } from "@/config/env"

export const APP_CONFIG = {
  name: "GLPI React App",
  apiUrl: env.apiUrl,
  defaultLocale: "fr-FR",
} as const
