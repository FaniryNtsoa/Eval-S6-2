export interface GlpiRefField {
  id: number
  name?: string
}

export interface GlpiTicketListItem {
  id: number
  name?: string
  content?: string
  type?: GlpiRefField | number
  status?: GlpiRefField | number
  priority?: GlpiRefField | number
  date?: string
  date_creation?: string
  date_mod?: string
  external_id?: string
  is_deleted?: boolean
}

export type GlpiTicketDetail = GlpiTicketListItem
