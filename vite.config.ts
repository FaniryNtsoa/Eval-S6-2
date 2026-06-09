import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const glpiProxyTarget = env.VITE_GLPI_PROXY_TARGET || "http://glpi.localhost"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // Doit être AVANT /api/glpi : sinon /api/glpi-legacy matche /api/glpi
        // et devient /api.php-legacy/... (erreur OAuth 400).
        "/api/glpi-legacy": {
          target: glpiProxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) =>
            requestPath.replace(/^\/api\/glpi-legacy/, "/apirest.php"),
        },
        "/api/glpi": {
          target: glpiProxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) =>
            requestPath.replace(/^\/api\/glpi/, "/api.php"),
        },
        "/api/kanban-config": {
          target: "http://localhost:8081",
          changeOrigin: true,
        },
      },
    },
  }
})