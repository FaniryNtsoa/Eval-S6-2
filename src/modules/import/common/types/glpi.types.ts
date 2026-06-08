export interface GlpiRef {
  id: number
  name?: string
}

export interface GlpiCreateResponse {
  id: number
  href: string
}

export interface GlpiListItem {
  id: number
  name?: string
  realname?: string
  username?: string
  otherserial?: string
  is_deleted?: boolean
}

export interface OpenAPIProperty {
  type?: string
  readOnly?: boolean
  "x-itemtype"?: string
  properties?: Record<string, OpenAPIProperty>
}

export interface OpenAPISchema {
  "x-itemtype"?: string
  properties?: Record<string, OpenAPIProperty>
}

export interface OpenAPISpec {
  paths: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, OpenAPISchema>
  }
}

export interface AssetRegistryEntry {
  itemType: string
  assetEndpoint: string
  modelDropdown?: string
  modelItemType?: string
  referenceFields: Record<string, string>
}

export interface AssetRegistry {
  assets: Map<string, AssetRegistryEntry>
  loadedAt: number
}
