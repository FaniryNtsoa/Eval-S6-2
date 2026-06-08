import Papa from "papaparse"

import {
  ASSET_CSV_COLUMNS,
  CORE_ASSET_CSV_COLUMNS,
} from "@/modules/import/asset/constants/asset-csv-columns"
import type { AssetCsvRow } from "@/modules/import/asset/types/asset-csv.types"

function normalizeRow(
  raw: Record<string, string | undefined>,
  rowIndex: number,
): AssetCsvRow {
  return {
    rowIndex,
    name: raw[ASSET_CSV_COLUMNS.name]?.trim() ?? "",
    status: raw[ASSET_CSV_COLUMNS.status]?.trim() ?? "",
    location: raw[ASSET_CSV_COLUMNS.location]?.trim() ?? "",
    manufacturer: raw[ASSET_CSV_COLUMNS.manufacturer]?.trim() ?? "",
    itemType: raw[ASSET_CSV_COLUMNS.itemType]?.trim() ?? "",
    model: raw[ASSET_CSV_COLUMNS.model]?.trim() ?? "",
    inventoryNumber: raw[ASSET_CSV_COLUMNS.inventoryNumber]?.trim() ?? "",
    user: raw[ASSET_CSV_COLUMNS.user]?.trim() ?? "",
  }
}

function validateColumns(headers: string[]): void {
  const missing = CORE_ASSET_CSV_COLUMNS.filter(
    (column) => !headers.includes(column),
  )

  if (missing.length > 0) {
    throw new Error(
      `Colonnes CSV obligatoires manquantes : ${missing.join(", ")}`,
    )
  }
}

function validateCoreRow(row: AssetCsvRow): string | null {
  if (!row.name) return "Name est requis"
  if (!row.itemType) return "Item_Type est requis"
  if (!row.inventoryNumber) return "Inventory_Number est requis"
  return null
}

export function parseAssetCsv(content: string): AssetCsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0]
    throw new Error(
      `Erreur CSV ligne ${firstError.row ?? "?"} : ${firstError.message}`,
    )
  }

  const headers = parsed.meta.fields ?? []
  validateColumns(headers)

  const rows: AssetCsvRow[] = []

  parsed.data.forEach((raw, index) => {
    const row = normalizeRow(raw, index + 2)
    const error = validateCoreRow(row)

    if (error) {
      throw new Error(`Ligne ${row.rowIndex} : ${error}`)
    }

    rows.push(row)
  })

  return rows
}

export function parseAssetCsvFile(file: File): Promise<AssetCsvRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        const content = String(reader.result ?? "")
        resolve(parseAssetCsv(content))
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Impossible de lire le fichier CSV"))
    }

    reader.readAsText(file)
  })
}
