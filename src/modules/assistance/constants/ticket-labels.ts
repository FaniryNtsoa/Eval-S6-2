export const TICKET_TYPE_LABELS: Record<number, string> = {
  1: "Incident",
  2: "Demande",
}

export const TICKET_STATUS_LABELS: Record<number, string> = {
  1: "Nouveau",
  2: "En cours (attribué)",
  3: "En cours (planifié)",
  4: "En attente",
  5: "Résolu",
  6: "Clos",
  10: "Validation",
}

export const TICKET_PRIORITY_LABELS: Record<number, string> = {
  1: "Très basse",
  2: "Basse",
  3: "Moyenne",
  4: "Haute",
  5: "Très haute",
}

export function formatItemTypeLabel(itemType: string): string {
  return itemType.replace(/([a-z])([A-Z])/g, "$1 $2")
}
