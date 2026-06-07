/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLPI_API_URL: string
  readonly VITE_GLPI_TOKEN_URL: string
  readonly VITE_GLPI_CLIENT_ID: string
  readonly VITE_GLPI_CLIENT_SECRET: string
  readonly VITE_GLPI_USERNAME: string
  readonly VITE_GLPI_PASSWORD: string
  readonly VITE_ADMIN_CODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
