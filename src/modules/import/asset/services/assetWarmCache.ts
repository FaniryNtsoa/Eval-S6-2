import { DROPDOWN_ENDPOINTS } from "@/modules/import/common/constants"
import type { ReferenceCache } from "@/modules/import/common/services/referenceCache"
import { getAssetEntry } from "@/modules/import/common/services/glpiSchemaRegistry"
import {
  warmDropdownCache,
  warmModelCaches,
} from "@/modules/import/common/services/referenceResolver"
import { warmUserCache } from "@/modules/import/common/services/userResolver"
import type { AssetRegistry } from "@/modules/import/common/types/glpi.types"
import type { AssetCsvRow } from "@/modules/import/asset/types/asset-csv.types"

export async function warmCachesForRows(
  rows: AssetCsvRow[],
  registry: AssetRegistry,
  cache: ReferenceCache,
): Promise<void> {
  let needsState = false
  let needsLocation = false
  let needsManufacturer = false
  let needsUsers = false
  const modelDropdowns = new Set<string>()

  for (const row of rows) {
    const entry = getAssetEntry(registry, row.itemType)
    if (!entry) {
      continue
    }

    if (entry.referenceFields.status) {
      needsState = true
    }

    if (entry.referenceFields.location) {
      needsLocation = true
    }

    if (entry.referenceFields.manufacturer) {
      needsManufacturer = true
    }

    if (entry.referenceFields.user) {
      needsUsers = true
    }

    if (entry.modelDropdown) {
      modelDropdowns.add(entry.modelDropdown)
    }
  }

  const tasks: Promise<void>[] = []

  if (needsState) {
    tasks.push(warmDropdownCache(cache, DROPDOWN_ENDPOINTS.state, "state"))
  }

  if (needsLocation) {
    tasks.push(warmDropdownCache(cache, DROPDOWN_ENDPOINTS.location, "location"))
  }

  if (needsManufacturer) {
    tasks.push(
      warmDropdownCache(cache, DROPDOWN_ENDPOINTS.manufacturer, "manufacturer"),
    )
  }

  if (needsUsers) {
    tasks.push(warmUserCache(cache))
  }

  if (modelDropdowns.size > 0) {
    tasks.push(warmModelCaches(cache, [...modelDropdowns]))
  }

  await Promise.all(tasks)
}
