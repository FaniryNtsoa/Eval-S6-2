import { env } from "@/config/env"
import type { ReferenceCache } from "@/modules/import/common/services/referenceCache"
import {
  createItem,
  findOneByField,
  listAll,
} from "@/modules/import/common/services/glpiResourceService"
import type { GlpiListItem } from "@/modules/import/common/types/glpi.types"
import { runOnce } from "@/modules/import/common/utils/inflight"
import { ensureUniqueSlug, slugify } from "@/modules/import/common/utils/slug"

const USER_ENDPOINT = "/Administration/User"
const USER_NAMESPACE = "user"

function userCacheKey(displayName: string): string {
  return displayName.trim().toLowerCase()
}

export async function warmUserCache(cache: ReferenceCache): Promise<void> {
  const users = await listAll<GlpiListItem>(USER_ENDPOINT, "realname")

  for (const user of users) {
    if (user.realname) {
      cache.set(USER_NAMESPACE, userCacheKey(user.realname), user.id)
    }

    if (user.username) {
      cache.set("username", user.username, user.id)
    }
  }
}

async function resolveUserByName(
  cache: ReferenceCache,
  trimmed: string,
): Promise<number> {
  const key = userCacheKey(trimmed)
  const cached = cache.get(USER_NAMESPACE, key)

  if (cached !== undefined) {
    return cached
  }

  const existing = await findOneByField<GlpiListItem>(
    USER_ENDPOINT,
    "realname",
    trimmed,
  )

  if (existing) {
    cache.set(USER_NAMESPACE, key, existing.id)
    return existing.id
  }

  const baseSlug = slugify(trimmed) || "import_user"
  const username = await resolveAvailableUsername(cache, baseSlug)

  const created = await createItem(USER_ENDPOINT, {
    username,
    realname: trimmed,
    firstname: "",
    password: env.glpiImportUserPassword,
    is_active: true,
  })

  cache.set(USER_NAMESPACE, key, created.id)
  cache.set("username", username, created.id)
  return created.id
}

export async function resolveUser(
  cache: ReferenceCache,
  displayName: string,
): Promise<number | null> {
  const trimmed = displayName.trim()
  if (!trimmed) {
    return null
  }

  return runOnce(`${USER_ENDPOINT}:${trimmed}`, () =>
    resolveUserByName(cache, trimmed),
  )
}

async function resolveAvailableUsername(
  cache: ReferenceCache,
  baseSlug: string,
): Promise<string> {
  const candidate = ensureUniqueSlug(baseSlug, (value) =>
    cache.has("username", value),
  )

  const existing = await findOneByField<GlpiListItem>(
    USER_ENDPOINT,
    "username",
    candidate,
  )

  if (!existing) {
    return candidate
  }

  cache.set("username", candidate, existing.id)
  return resolveAvailableUsername(cache, `${baseSlug}_${Date.now()}`)
}
