import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
} from "@/modules/assistance/constants/ticket-labels"
import type { GlpiRefField } from "@/modules/assistance/types/ticket.types"

export function resolveRefField(
  value: GlpiRefField | number | undefined | null,
  labels?: Record<number, string>,
): { id?: number; label: string } {
  if (value == null) {
    return { label: "—" }
  }

  if (typeof value === "number") {
    return {
      id: value,
      label: labels?.[value] ?? String(value),
    }
  }

  const id = value.id
  const name = value.name?.trim()

  return {
    id,
    label: name || (labels && id !== undefined ? labels[id] : undefined) || String(id),
  }
}

export function resolveTicketType(value: GlpiRefField | number | undefined | null) {
  return resolveRefField(value, TICKET_TYPE_LABELS)
}

export function resolveTicketStatus(value: GlpiRefField | number | undefined | null) {
  return resolveRefField(value, TICKET_STATUS_LABELS)
}

export function resolveTicketPriority(
  value: GlpiRefField | number | undefined | null,
) {
  return resolveRefField(value, TICKET_PRIORITY_LABELS)
}

export function stripHtml(content: string | undefined): string {
  if (!content) {
    return "—"
  }

  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
