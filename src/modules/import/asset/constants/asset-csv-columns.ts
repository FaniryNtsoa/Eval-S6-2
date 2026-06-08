export const ASSET_CSV_COLUMNS = {
  name: "Name",
  status: "Status",
  location: "Location",
  manufacturer: "Manufacturer",
  itemType: "Item_Type",
  model: "Model",
  inventoryNumber: "Inventory_Number",
  user: "User",
} as const

export const CORE_ASSET_CSV_COLUMNS = [
  ASSET_CSV_COLUMNS.name,
  ASSET_CSV_COLUMNS.itemType,
  ASSET_CSV_COLUMNS.inventoryNumber,
] as const

export const OPTIONAL_ASSET_CSV_COLUMNS = [
  ASSET_CSV_COLUMNS.status,
  ASSET_CSV_COLUMNS.location,
  ASSET_CSV_COLUMNS.manufacturer,
  ASSET_CSV_COLUMNS.model,
  ASSET_CSV_COLUMNS.user,
] as const
