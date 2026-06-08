import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type Method,
} from "axios"

import { env } from "@/config/env"
import { getErrorMessage } from "@/modules/import/common/services/glpiResourceService"

interface LegacySessionResponse {
  session_token: string
}

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean
}

let sessionToken: string | null = null
let initPromise: Promise<string> | null = null

function buildLegacyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (env.glpiAppToken) {
    headers["App-Token"] = env.glpiAppToken
  }

  if (sessionToken) {
    headers["Session-Token"] = sessionToken
  }

  return headers
}

async function initLegacySession(): Promise<string> {
  if (!env.glpiUserToken) {
    throw new Error(
      "VITE_GLPI_USER_TOKEN manquant — requis pour l'API Legacy (liaison actifs).",
    )
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `user_token ${env.glpiUserToken}`,
  }

  if (env.glpiAppToken) {
    headers["App-Token"] = env.glpiAppToken
  }

  const { data } = await axios.get<LegacySessionResponse>(
    `${env.glpiLegacyApiUrl}/initSession`,
    { headers },
  )

  if (!data.session_token) {
    throw new Error("Réponse initSession invalide : session_token manquant")
  }

  sessionToken = data.session_token
  return sessionToken
}

async function ensureLegacySession(): Promise<string> {
  if (sessionToken) {
    return sessionToken
  }

  if (!initPromise) {
    initPromise = initLegacySession().finally(() => {
      initPromise = null
    })
  }

  return initPromise
}

export function clearLegacySession(): void {
  sessionToken = null
  initPromise = null
}

export async function legacyRequest<T>(
  method: Method,
  path: string,
  data?: unknown,
): Promise<T> {
  await ensureLegacySession()

  const config: RetryableConfig = {
    method,
    url: `${env.glpiLegacyApiUrl}${path}`,
    headers: buildLegacyHeaders(),
    data,
  }

  try {
    const response = await axios.request<T>(config)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status

    if (status === 401 && !config._retry) {
      clearLegacySession()
      config._retry = true
      await ensureLegacySession()
      config.headers = buildLegacyHeaders()

      const response = await axios.request<T>(config)
      return response.data
    }

    throw new Error(getErrorMessage(error))
  }
}

export async function legacyCreate<T extends { id: number }>(
  itemType: string,
  input: Record<string, unknown>,
): Promise<T> {
  const data = await legacyRequest<T | T[]>("POST", `/${itemType}/`, { input })

  if (Array.isArray(data)) {
    return data[0]
  }

  return data
}

export async function legacyDelete(itemType: string, id: number): Promise<void> {
  await legacyRequest("DELETE", `/${itemType}/${id}`)
}

export async function legacyList<T>(
  path: string,
): Promise<T[]> {
  const data = await legacyRequest<T[]>("GET", path)

  if (!Array.isArray(data)) {
    return []
  }

  return data
}
