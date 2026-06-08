import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"

import { env } from "@/config/env"
import { fetchGlpiToken } from "@/modules/auth/services/glpiAuthService"

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000

let accessToken: string | null = null
let expiresAt: number | null = null
let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const token = await fetchGlpiToken()
      accessToken = token.accessToken
      expiresAt = token.expiresAt
      return true
    } catch {
      accessToken = null
      expiresAt = null
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function ensureToken(): Promise<boolean> {
  if (!accessToken || !expiresAt) {
    return refreshToken()
  }

  if (Date.now() >= expiresAt) {
    accessToken = null
    expiresAt = null
    return refreshToken()
  }

  if (Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return refreshToken()
  }

  return true
}

async function retryWithFreshToken(
  config: RetryableRequestConfig,
): Promise<AxiosResponse> {
  const refreshed = await refreshToken()

  if (!refreshed || !accessToken) {
    throw new Error("Impossible d'accéder à l'API GLPI")
  }

  config.headers.Authorization = `Bearer ${accessToken}`
  return publicGlpiClient.request(config)
}

export const publicGlpiClient = axios.create({
  baseURL: env.glpiApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "fr_FR",
  },
})

publicGlpiClient.interceptors.request.use(async (config) => {
  const sessionValid = await ensureToken()

  if (!sessionValid || !accessToken) {
    return Promise.reject(new Error("Impossible d'accéder à l'API GLPI"))
  }

  config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

publicGlpiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (config && !config._retry && status === 401) {
      config._retry = true
      return retryWithFreshToken(config)
    }

    return Promise.reject(error)
  },
)
