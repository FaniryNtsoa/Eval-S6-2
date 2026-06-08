export function escapeRsqlValue(value: string): string {
  const trimmed = value.trim()

  if (/[,;()=]/.test(trimmed) || trimmed.includes('"')) {
    return `"${trimmed.replace(/"/g, '\\"')}"`
  }

  return trimmed
}

export function buildRsqlEquals(field: string, value: string): string {
  return `${field}==${escapeRsqlValue(value)}`
}

export function buildRsqlAnd(...parts: string[]): string {
  return parts.filter(Boolean).join(";")
}
