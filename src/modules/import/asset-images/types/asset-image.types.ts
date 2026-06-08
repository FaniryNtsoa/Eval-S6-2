export interface ParsedAssetImage {
  rowIndex: number
  assetName: string
  filename: string
  uploadFilename: string
  blob: Blob
  mimeType: string
  documenttypesId: number
}

export interface AssetNameRef {
  itemType: string
  id: number
}

export type AssetNameRefMap = Map<string, AssetNameRef>
