import { create } from "zustand"
import { persist } from "zustand/middleware"

import { fetchGlpiToken } from "@/modules/auth/services/glpiAuthService"
import { validateAdminCode } from "@/modules/auth/services/authService"

const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000

let expiryTimer: ReturnType<typeof setTimeout> | null = null
let refreshPromise: Promise<boolean> | null = null

function clearExpiryTimer() {
  if (expiryTimer) {
    clearTimeout(expiryTimer)
    expiryTimer = null
  }
}

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  expiresAt: number | null
  login: (code: string) => Promise<boolean>
  logout: () => void
  checkSession: () => boolean
  refreshSession: () => Promise<boolean>
  ensureSession: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const logout = () => {
        clearExpiryTimer()
        refreshPromise = null
        set({
          isAuthenticated: false,
          accessToken: null,
          expiresAt: null,
        })
      }

      const scheduleExpiryTimer = (expiresAt: number) => {
        clearExpiryTimer()
        const delay = expiresAt - Date.now()

        if (delay <= 0) {
          logout()
          return
        }

        expiryTimer = setTimeout(() => logout(), delay)
      }

      const checkSession = () => {
        const { isAuthenticated, expiresAt } = get()

        if (!isAuthenticated || !expiresAt) {
          return false
        }

        if (Date.now() >= expiresAt) {
          logout()
          return false
        }

        return true
      }

      const refreshSession = async () => {
        if (refreshPromise) {
          return refreshPromise
        }

        refreshPromise = (async () => {
          try {
            const { accessToken, expiresAt } = await fetchGlpiToken()

            set({
              isAuthenticated: true,
              accessToken,
              expiresAt,
            })
            scheduleExpiryTimer(expiresAt)

            return true
          } catch {
            logout()
            return false
          } finally {
            refreshPromise = null
          }
        })()

        return refreshPromise
      }

      const ensureSession = async () => {
        const { isAuthenticated, accessToken, expiresAt } = get()

        if (!isAuthenticated || !expiresAt) {
          return false
        }

        if (Date.now() >= expiresAt) {
          logout()
          return false
        }

        if (!accessToken || Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS) {
          return refreshSession()
        }

        return true
      }

      return {
        isAuthenticated: false,
        accessToken: null,
        expiresAt: null,
        login: async (code) => {
          if (!validateAdminCode(code)) {
            return false
          }

          return refreshSession()
        },
        logout,
        checkSession,
        refreshSession,
        ensureSession,
      }
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        if (!state.checkSession()) {
          return
        }

        if (state.expiresAt) {
          const delay = state.expiresAt - Date.now()
          if (delay <= 0) {
            state.logout()
            return
          }

          expiryTimer = setTimeout(() => state.logout(), delay)
        }
      },
    },
  ),
)
