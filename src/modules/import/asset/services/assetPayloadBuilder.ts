import type { AssetCsvRow, AssetImportPayload } from "@/modules/import/asset/types/asset-csv.types"
import type { ReferenceCache } from "@/modules/import/common/services/referenceCache"
import {
  resolveLocation,
  resolveManufacturer,
  resolveModel,
  resolveState,
} from "@/modules/import/common/services/referenceResolver"
import { resolveUser } from "@/modules/import/common/services/userResolver"
import type { AssetRegistryEntry } from "@/modules/import/common/types/glpi.types"

export async function buildAssetPayload(
  row: AssetCsvRow,
  entry: AssetRegistryEntry,
  cache: ReferenceCache,
): Promise<AssetImportPayload> {
  const payload: AssetImportPayload = {
    name: row.name,
    otherserial: row.inventoryNumber,
  }

  const resolutions: Promise<void>[] = []

  if (entry.referenceFields.status) {
    resolutions.push(
      resolveState(cache, row.status).then((id) => {
        payload.status = { id }
      }),
    )
  }

  if (entry.referenceFields.location) {
    resolutions.push(
      resolveLocation(cache, row.location).then((id) => {
        payload.location = { id }
      }),
    )
  }

  if (entry.referenceFields.manufacturer) {
    resolutions.push(
      resolveManufacturer(cache, row.manufacturer).then((id) => {
        payload.manufacturer = { id }
      }),
    )
  }

  if (entry.modelDropdown) {
    resolutions.push(
      resolveModel(cache, entry.modelDropdown, row.model).then((id) => {
        payload.model = { id }
      }),
    )
  }

  if (entry.referenceFields.user && row.user.trim()) {
    resolutions.push(
      resolveUser(cache, row.user).then((id) => {
        if (id !== null) {
          payload.user = { id }
        }
      }),
    )
  }

  await Promise.all(resolutions)

  return payload
}
