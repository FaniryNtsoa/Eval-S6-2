import { formatItemTypeLabel } from "@/modules/assistance/constants/ticket-labels"
import {
  GLPI_PAGE_SIZE,
  IMPORT_CONCURRENCY,
} from "@/modules/import/common/constants"
import {
  isImportableAsset,
  loadAssetRegistry,
} from "@/modules/import/common/services/glpiSchemaRegistry"
import type { AssetRegistryEntry } from "@/modules/import/common/types/glpi.types"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import type {
  ElementListItem,
  GlpiAssetListItem,
} from "@/modules/inventory/types/element.types"
import { publicGlpiClient } from "@/services/api/publicGlpiClient"

const ACTIVE_ONLY_FILTER = "is_deleted==0"

async function listAssetsForType<T extends { id: number }>(
  endpoint: string,
): Promise<T[]> {
  const items: T[] = []
  let start = 0

  while (true) {
    const { data } = await publicGlpiClient.get<T[]>(endpoint, {
      params: {
        start,
        limit: GLPI_PAGE_SIZE,
        filter: ACTIVE_ONLY_FILTER,
      },
    })

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    items.push(...data)

    if (data.length < GLPI_PAGE_SIZE) {
      break
    }

    start += GLPI_PAGE_SIZE
  }

  return items
}

function normalizeElement(
  item: GlpiAssetListItem,
  entry: AssetRegistryEntry,
): ElementListItem {
  return {
    id: item.id,
    itemType: entry.itemType,
    itemTypeLabel: formatItemTypeLabel(entry.itemType),
    name: item.name,
    inventoryNumber: item.otherserial,
    status: item.status,
    location: item.location,
    manufacturer: item.manufacturer,
    model: item.model,
    user: item.user,
  }
}

export async function fetchElements(): Promise<ElementListItem[]> {
  const registry = await loadAssetRegistry()
  const entries = [...registry.assets.values()].filter(isImportableAsset)

  const batches = await runConcurrent(
    entries,
    IMPORT_CONCURRENCY,
    async (entry) => {
      const items = await listAssetsForType<GlpiAssetListItem>(
        entry.assetEndpoint,
      )

      return items.map((item) => normalizeElement(item, entry))
    },
  )

  return batches
    .flat()
    .sort(
      (a, b) =>
        a.itemTypeLabel.localeCompare(b.itemTypeLabel, "fr") || b.id - a.id,
    )
}
