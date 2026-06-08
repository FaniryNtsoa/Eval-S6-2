export interface AssetCsvRow {
  rowIndex: number
  name: string
  status: string
  location: string
  manufacturer: string
  itemType: string
  model: string
  inventoryNumber: string
  user: string
}

export interface AssetImportPayload {
  name: string
  otherserial: string
  status?: { id: number }
  location?: { id: number }
  manufacturer?: { id: number }
  model?: { id: number }
  user?: { id: number }
}
