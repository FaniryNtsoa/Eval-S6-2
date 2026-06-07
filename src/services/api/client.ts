import axios from "axios"

import { env } from "@/config/env"
import { useAuthStore } from "@/services/stores/authStore"

export const glpiClient = axios.create({
  baseURL: env.glpiApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "fr_FR",
  },
})

glpiClient.interceptors.request.use((config) => {
  const { accessToken, checkSession, logout } = useAuthStore.getState()

  if (!checkSession()) {
    logout()
    return Promise.reject(new Error("Session expirée"))
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

glpiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  },
)
