import { env } from "@/config/env"
import { findOneByField } from "@/modules/import/common/services/glpiResourceService"
import type { GlpiListItem } from "@/modules/import/common/types/glpi.types"
import { glpiClient } from "@/services/api/client"

interface CurrentUser {
  id: number
  name?: string
  realname?: string
}

const USER_ENDPOINT = "/Administration/User"

let cachedUserId: number | null = null

export async function getCurrentUserId(): Promise<number> {
  if (cachedUserId !== null) {
    return cachedUserId
  }

  try {
    const { data } = await glpiClient.get<CurrentUser>(`${USER_ENDPOINT}/Me`)
    cachedUserId = data.id
    return cachedUserId
  } catch {
    const existing = await findOneByField<GlpiListItem>(
      USER_ENDPOINT,
      "username",
      env.glpiUsername,
    )

    if (!existing) {
      throw new Error(
        "Impossible de résoudre l'utilisateur API courant. Vérifiez le scope OAuth « user ».",
      )
    }

    cachedUserId = existing.id
    return cachedUserId
  }
}

export function clearCurrentUserCache(): void {
  cachedUserId = null
}
