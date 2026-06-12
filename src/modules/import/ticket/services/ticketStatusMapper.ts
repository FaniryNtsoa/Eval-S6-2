const STATUS_ALIASES: Record<string, number> = {
  new: 1,
  nouveau: 1,
  "in progress (assigned)": 2,
  "in progress": 2,
  "en cours (attribué)": 2,
  "en cours (assigné)": 2,
  assigned: 2,
  "en cours (planifié)": 3,
  planned: 3,
  "en attente": 4,
  pending: 4,
  waiting: 4,
  résolu: 5,
  resolu: 5,
  solved: 5,
  resolved: 5,
  clos: 6,
  closed: 6,
  close: 6,
  validation: 10,
}

export function mapTicketStatus(status: string): number {
  const normalized = status.trim().toLowerCase()
  const mapped = STATUS_ALIASES[normalized]

  if (mapped === undefined) {
    throw new Error(`Statut ticket inconnu : ${status}`)
  }

  return mapped
}

export function isDefaultTicketStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase()
  return normalized === "" || normalized === "new" || normalized === "nouveau"
}

const TYPE_ALIASES: Record<string, number> = {
  incident: 1,
  request: 2,
  demande: 2,
}

export function mapTicketType(type: string): number {
  const normalized = type.trim().toLowerCase()
  const mapped = TYPE_ALIASES[normalized]

  if (mapped === undefined) {
    throw new Error(`Type ticket inconnu : ${type}`)
  }

  return mapped
}

const PRIORITY_ALIASES: Record<string, number> = {
  "very low": 1,
  low: 2,
  medium: 3,
  high: 4,
  "very high": 5,
  "très bas": 1,
  "tres bas": 1,
  bas: 2,
  moyen: 3,
  moyenne: 3,
  élevé: 4,
  eleve: 4,
  élevée: 4,
  elevee: 4,
  "très élevé": 5,
  "très élevée": 5,
  "tres eleve": 5,
  "tres elevee": 5,
  critical: 5,
  critique: 5,
  "très haute": 5,
  "tres haute": 5,
}

export function mapTicketPriority(priority: string): number {
  const normalized = priority.trim().toLowerCase()
  const mapped = PRIORITY_ALIASES[normalized]

  if (mapped === undefined) {
    throw new Error(`Priorité ticket inconnue : ${priority}`)
  }

  return mapped
}
