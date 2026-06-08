import axios from "axios"

import { env } from "@/config/env"

interface GlpiTokenResponse {
  token_type: string
  expires_in: number
  access_token: string
}

export async function fetchGlpiToken(): Promise<{
  accessToken: string
  expiresAt: number
}> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: env.glpiClientId,
    client_secret: env.glpiClientSecret,
    username: env.glpiUsername,
    password: env.glpiPassword,
    scope: "api user",
  })

  const { data } = await axios.post<GlpiTokenResponse>(
    env.glpiTokenUrl,
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}
