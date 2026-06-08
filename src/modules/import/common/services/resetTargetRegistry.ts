import { isImportableAsset } from "@/modules/import/common/services/glpiSchemaRegistry"
import type { AssetRegistry } from "@/modules/import/common/types/glpi.types"

export interface ResetTargets {
  assetEndpoints: string[]
  dropdownEndpoints: string[]
}

const COMMON_REFERENCE_DROPDOWNS = [
  "/Dropdowns/State",
  "/Dropdowns/Location",
  "/Dropdowns/Manufacturer",
] as const

export function buildResetTargets(registry: AssetRegistry): ResetTargets {
  const assetEndpoints = new Set<string>()
  const dropdownEndpoints = new Set<string>(COMMON_REFERENCE_DROPDOWNS)

  for (const entry of registry.assets.values()) {
    if (!isImportableAsset(entry)) {
      continue
    }

    assetEndpoints.add(entry.assetEndpoint)

    if (entry.modelDropdown) {
      dropdownEndpoints.add(entry.modelDropdown)
    }

    for (const itemType of Object.values(entry.referenceFields)) {
      if (itemType === "User") {
        continue
      }

      dropdownEndpoints.add(`/Dropdowns/${itemType}`)
    }
  }

  return {
    assetEndpoints: [...assetEndpoints].sort(),
    dropdownEndpoints: [...dropdownEndpoints].sort(),
  }
}
