import { env } from "@/config/env"
import {
  ACTIVE_ONLY_FILTER,
  findOneByField,
} from "@/modules/import/common/services/glpiResourceService"
import type { GlpiListItem } from "@/modules/import/common/types/glpi.types"
import { buildRsqlAnd, buildRsqlEquals } from "@/modules/import/common/utils/rsql"
import { glpiClient } from "@/services/api/client"
import { publicGlpiClient } from "@/services/api/publicGlpiClient"

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

let cachedPublicUserId: number | null = null

export async function getPublicCurrentUserId(): Promise<number> {
  if (cachedPublicUserId !== null) {
    return cachedPublicUserId
  }

  try {
    const { data } = await publicGlpiClient.get<CurrentUser>(
      `${USER_ENDPOINT}/Me`,
    )
    cachedPublicUserId = data.id
    return cachedPublicUserId
  } catch {
    const { data } = await publicGlpiClient.get<GlpiListItem[]>(USER_ENDPOINT, {
      params: {
        filter: buildRsqlAnd(
          buildRsqlEquals("username", env.glpiUsername),
          ACTIVE_ONLY_FILTER,
        ),
        limit: 1,
      },
    })

    const existing = Array.isArray(data) && data.length > 0 ? data[0] : null

    if (!existing) {
      throw new Error(
        "Impossible de résoudre l'utilisateur API courant pour le frontoffice.",
      )
    }

    cachedPublicUserId = existing.id
    return cachedPublicUserId
  }
}
