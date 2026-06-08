import type {
  AssetRegistry,
  AssetRegistryEntry,
  OpenAPISpec,
} from "@/modules/import/common/types/glpi.types"
import { fetchOpenApiSpec } from "@/modules/import/common/services/glpiResourceService"

const REFERENCE_FIELDS = ["status", "location", "manufacturer", "user"] as const

let cachedRegistry: AssetRegistry | null = null

function buildRegistry(spec: OpenAPISpec): AssetRegistry {
  const schemas = spec.components?.schemas ?? {}
  const assets = new Map<string, AssetRegistryEntry>()

  for (const [path, methods] of Object.entries(spec.paths)) {
    if (!path.startsWith("/Assets/") || !("post" in methods)) {
      continue
    }

    const segments = path.split("/").filter(Boolean)
    if (segments.length !== 2) {
      continue
    }

    const itemType = segments[1]
    const schema = schemas[itemType]
    if (!schema?.properties) {
      continue
    }

    const modelProp = schema.properties.model
    const modelItemType = modelProp?.["x-itemtype"]
    const referenceFields: Record<string, string> = {}

    for (const field of REFERENCE_FIELDS) {
      const itemtype = schema.properties[field]?.["x-itemtype"]
      if (itemtype) {
        referenceFields[field] = itemtype
      }
    }

    assets.set(itemType, {
      itemType,
      assetEndpoint: path,
      modelDropdown: modelItemType ? `/Dropdowns/${modelItemType}` : undefined,
      modelItemType,
      referenceFields,
    })
  }

  return {
    assets,
    loadedAt: Date.now(),
  }
}

export async function loadAssetRegistry(force = false): Promise<AssetRegistry> {
  if (!force && cachedRegistry) {
    return cachedRegistry
  }

  const spec = (await fetchOpenApiSpec()) as OpenAPISpec
  cachedRegistry = buildRegistry(spec)
  return cachedRegistry
}

export function isImportableAsset(entry: AssetRegistryEntry): boolean {
  const { referenceFields } = entry

  return Boolean(
    referenceFields.status &&
      referenceFields.location &&
      referenceFields.manufacturer,
  )
}

export function getAssetEntry(
  registry: AssetRegistry,
  itemType: string,
): AssetRegistryEntry | undefined {
  return registry.assets.get(itemType)
}

export function clearAssetRegistryCache(): void {
  cachedRegistry = null
}
