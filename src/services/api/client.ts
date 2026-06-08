import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"

import { env } from "@/config/env"
import { useAuthStore } from "@/services/stores/authStore"

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function isUnauthenticatedPayload(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    (data as { status: string }).status === "ERROR_UNAUTHENTICATED"
  )
}

function getUnauthenticatedMessage(data: unknown): string {
  if (typeof data === "object" && data !== null) {
    const payload = data as { title?: string; detail?: string }
    return payload.detail ?? payload.title ?? "Non authentifié"
  }

  return "Non authentifié"
}

async function retryWithFreshToken(
  config: RetryableRequestConfig,
): Promise<AxiosResponse> {
  const refreshed = await useAuthStore.getState().refreshSession()

  if (!refreshed) {
    useAuthStore.getState().logout()
    throw new Error("Session expirée")
  }

  const { accessToken } = useAuthStore.getState()
  config.headers.Authorization = `Bearer ${accessToken}`
  return glpiClient.request(config)
}

export const glpiClient = axios.create({
  baseURL: env.glpiApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "fr_FR",
  },
})

glpiClient.interceptors.request.use(async (config) => {
  const sessionValid = await useAuthStore.getState().ensureSession()

  if (!sessionValid) {
    useAuthStore.getState().logout()
    return Promise.reject(new Error("Session expirée"))
  }

  const { accessToken } = useAuthStore.getState()

  if (!accessToken) {
    return Promise.reject(new Error("Token d'accès manquant"))
  }

  config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

glpiClient.interceptors.response.use(
  async (response) => {
    if (!isUnauthenticatedPayload(response.data)) {
      return response
    }

    const config = response.config as RetryableRequestConfig

    if (config._retry) {
      return Promise.reject(new Error(getUnauthenticatedMessage(response.data)))
    }

    config._retry = true
    return retryWithFreshToken(config)
  },
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    const shouldRetry =
      config &&
      !config._retry &&
      (status === 401 || isUnauthenticatedPayload(error.response?.data))

    if (shouldRetry) {
      config._retry = true
      return retryWithFreshToken(config)
    }

    if (status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  },
)
