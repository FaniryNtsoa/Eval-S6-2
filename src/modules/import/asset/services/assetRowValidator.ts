import { ASSET_CSV_COLUMNS } from "@/modules/import/asset/constants/asset-csv-columns"
import type { AssetCsvRow } from "@/modules/import/asset/types/asset-csv.types"
import { getAssetEntry } from "@/modules/import/common/services/glpiSchemaRegistry"
import type { AssetRegistry } from "@/modules/import/common/types/glpi.types"

function requireField(
  value: string,
  columnLabel: string,
  itemType: string,
): string | null {
  if (!value.trim()) {
    return `${columnLabel} est requis pour le type d'actif "${itemType}"`
  }

  return null
}

export function validateAssetRowAgainstSchema(
  row: AssetCsvRow,
  registry: AssetRegistry,
): string | null {
  if (!row.name.trim()) {
    return "Name est requis"
  }

  if (!row.itemType.trim()) {
    return "Item_Type est requis"
  }

  if (!row.inventoryNumber.trim()) {
    return "Inventory_Number est requis"
  }

  const entry = getAssetEntry(registry, row.itemType)

  if (!entry) {
    return `Type d'actif inconnu : "${row.itemType}". Vérifiez Item_Type.`
  }

  const checks: Array<string | null> = []

  if (entry.referenceFields.status) {
    checks.push(
      requireField(row.status, ASSET_CSV_COLUMNS.status, row.itemType),
    )
  }

  if (entry.referenceFields.location) {
    checks.push(
      requireField(row.location, ASSET_CSV_COLUMNS.location, row.itemType),
    )
  }

  if (entry.referenceFields.manufacturer) {
    checks.push(
      requireField(
        row.manufacturer,
        ASSET_CSV_COLUMNS.manufacturer,
        row.itemType,
      ),
    )
  }

  if (entry.modelDropdown) {
    checks.push(
      requireField(row.model, ASSET_CSV_COLUMNS.model, row.itemType),
    )
  }

  return checks.find((message) => message !== null) ?? null
}

export function validateAllRowsAgainstSchema(
  rows: AssetCsvRow[],
  registry: AssetRegistry,
): void {
  for (const row of rows) {
    const error = validateAssetRowAgainstSchema(row, registry)

    if (error) {
      throw new Error(`Ligne ${row.rowIndex} : ${error}`)
    }
  }
}
