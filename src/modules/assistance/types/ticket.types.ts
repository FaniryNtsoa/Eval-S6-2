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

export interface TicketLinkedElement {
  itemType: string
  itemId: number
}

export interface CreateTicketFormValues {
  title: string
  description: string
  type: number
  priority: number
  status: number
  externalId: string
}

export interface CreateTicketInput {
  title: string
  description: string
  type: number
  priority: number
  status?: number
  externalId?: string
  elements: TicketLinkedElement[]
}

export interface CreateTicketResult {
  ticketId: number
  warnings: string[]
}

export const DEFAULT_CREATE_TICKET_FORM: CreateTicketFormValues = {
  title: "",
  description: "",
  type: 1,
  priority: 3,
  status: 1,
  externalId: "",
}
