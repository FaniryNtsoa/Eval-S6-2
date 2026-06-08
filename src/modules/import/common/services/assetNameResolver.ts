import {
  isImportableAsset,
} from "@/modules/import/common/services/glpiSchemaRegistry"
import { findOneByField } from "@/modules/import/common/services/glpiResourceService"
import type { AssetRegistry, GlpiListItem } from "@/modules/import/common/types/glpi.types"
import { runOnce } from "@/modules/import/common/utils/inflight"

export interface ResolvedAssetByName {
  itemType: string
  id: number
  name: string
}

const assetNameCache = new Map<string, ResolvedAssetByName>()

function cacheKey(name: string): string {
  return name.trim().toLowerCase()
}

async function searchAssetByName(
  registry: AssetRegistry,
  name: string,
): Promise<ResolvedAssetByName | null> {
  for (const entry of registry.assets.values()) {
    if (!isImportableAsset(entry)) {
      continue
    }

    const existing = await findOneByField<GlpiListItem>(
      entry.assetEndpoint,
      "name",
      name,
      { activeOnly: true },
    )

    if (existing) {
      return {
        itemType: entry.itemType,
        id: existing.id,
        name,
      }
    }
  }

  return null
}

export async function resolveAssetByName(
  registry: AssetRegistry,
  name: string,
): Promise<ResolvedAssetByName> {
  const trimmed = name.trim()

  if (!trimmed) {
    throw new Error("Nom d'actif vide")
  }

  const key = cacheKey(trimmed)
  const cached = assetNameCache.get(key)

  if (cached) {
    return cached
  }

  return runOnce(`${key}`, async () => {
    const cachedAfterWait = assetNameCache.get(key)
    if (cachedAfterWait) {
      return cachedAfterWait
    }

    const resolved = await searchAssetByName(registry, trimmed)

    if (!resolved) {
      throw new Error(`Actif introuvable : ${trimmed}`)
    }

    assetNameCache.set(key, resolved)
    return resolved
  })
}

export function clearAssetNameCache(): void {
  assetNameCache.clear()
}
