import type { GlpiRefField } from "@/modules/assistance/types/ticket.types"

export interface GlpiAssetListItem {
  id: number
  name?: string
  otherserial?: string
  status?: GlpiRefField | number
  location?: GlpiRefField | number
  manufacturer?: GlpiRefField | number
  model?: GlpiRefField | number
  user?: GlpiRefField | number
  is_deleted?: boolean
}

export interface ElementListItem {
  id: number
  itemType: string
  itemTypeLabel: string
  name?: string
  inventoryNumber?: string
  status?: GlpiRefField | number
  location?: GlpiRefField | number
  manufacturer?: GlpiRefField | number
  model?: GlpiRefField | number
  user?: GlpiRefField | number
}

export interface ElementSearchCriteria {
  query: string
  itemType: string
  status: string
  location: string
  manufacturer: string
  user: string
}

export const EMPTY_ELEMENT_SEARCH: ElementSearchCriteria = {
  query: "",
  itemType: "",
  status: "",
  location: "",
  manufacturer: "",
  user: "",
}
