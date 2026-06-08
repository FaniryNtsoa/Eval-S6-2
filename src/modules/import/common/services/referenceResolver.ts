import { DROPDOWN_ENDPOINTS } from "@/modules/import/common/constants"
import type { ReferenceCache } from "@/modules/import/common/services/referenceCache"
import {
  createItem,
  findOneByField,
  listAll,
} from "@/modules/import/common/services/glpiResourceService"
import type { GlpiListItem } from "@/modules/import/common/types/glpi.types"
import { runOnce } from "@/modules/import/common/utils/inflight"

function cacheKey(namespace: string, name: string): string {
  return `${namespace}:${name.trim().toLowerCase()}`
}

export async function warmDropdownCache(
  cache: ReferenceCache,
  endpoint: string,
  namespace: string,
): Promise<void> {
  const items = await listAll<GlpiListItem>(endpoint)

  for (const item of items) {
    if (item.name) {
      cache.set(namespace, cacheKey(namespace, item.name), item.id)
    }
  }
}

export async function warmModelCaches(
  cache: ReferenceCache,
  modelDropdowns: string[],
): Promise<void> {
  const uniqueEndpoints = [...new Set(modelDropdowns.filter(Boolean))]

  await Promise.all(
    uniqueEndpoints.map(async (endpoint) => {
      await warmDropdownCache(cache, endpoint, endpoint)
    }),
  )
}

async function resolveDropdown(
  cache: ReferenceCache,
  endpoint: string,
  namespace: string,
  name: string,
): Promise<number> {
  const normalizedKey = cacheKey(namespace, name)
  const cached = cache.get(namespace, normalizedKey)

  if (cached !== undefined) {
    return cached
  }

  return runOnce(`${endpoint}:${name}`, async () => {
    const cachedAfterWait = cache.get(namespace, normalizedKey)
    if (cachedAfterWait !== undefined) {
      return cachedAfterWait
    }

    const existing = await findOneByField<GlpiListItem>(endpoint, "name", name)

    if (existing) {
      cache.set(namespace, normalizedKey, existing.id)
      return existing.id
    }

    const created = await createItem(endpoint, { name })
    cache.set(namespace, normalizedKey, created.id)
    return created.id
  })
}

export async function resolveState(
  cache: ReferenceCache,
  name: string,
): Promise<number> {
  return resolveDropdown(
    cache,
    DROPDOWN_ENDPOINTS.state,
    "state",
    name,
  )
}

export async function resolveLocation(
  cache: ReferenceCache,
  name: string,
): Promise<number> {
  return resolveDropdown(
    cache,
    DROPDOWN_ENDPOINTS.location,
    "location",
    name,
  )
}

export async function resolveManufacturer(
  cache: ReferenceCache,
  name: string,
): Promise<number> {
  return resolveDropdown(
    cache,
    DROPDOWN_ENDPOINTS.manufacturer,
    "manufacturer",
    name,
  )
}

export async function resolveModel(
  cache: ReferenceCache,
  modelDropdown: string,
  name: string,
): Promise<number> {
  return resolveDropdown(cache, modelDropdown, modelDropdown, name)
}
