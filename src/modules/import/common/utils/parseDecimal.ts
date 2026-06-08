export function parseDecimal(value: string, fieldLabel = "Valeur"): number {
  const trimmed = value.trim()

  if (!trimmed) {
    return 0
  }

  const normalized = trimmed.replace(",", ".")
  const parsed = Number.parseFloat(normalized)

  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldLabel} numérique invalide : ${value}`)
  }

  return parsed
}
