/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLPI_API_URL: string
  readonly VITE_GLPI_TOKEN_URL: string
  readonly VITE_GLPI_PROXY_TARGET: string
  readonly VITE_GLPI_CLIENT_ID: string
  readonly VITE_GLPI_CLIENT_SECRET: string
  readonly VITE_GLPI_USERNAME: string
  readonly VITE_GLPI_PASSWORD: string
  readonly VITE_ADMIN_CODE: string
  readonly VITE_GLPI_IMPORT_USER_PASSWORD: string
  readonly VITE_GLPI_LEGACY_API_URL: string
  readonly VITE_GLPI_APP_TOKEN: string
  readonly VITE_GLPI_USER_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
