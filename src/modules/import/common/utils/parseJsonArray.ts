export function parseJsonStringArray(raw: string, fieldLabel = "Items"): string[] {
  const trimmed = raw.trim()

  if (!trimmed) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)

    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldLabel} doit être un tableau JSON`)
    }

    return parsed.map((entry) => String(entry).trim()).filter(Boolean)
  } catch (error) {
    if (error instanceof Error && error.message.includes("tableau JSON")) {
      throw error
    }

    throw new Error(`${fieldLabel} JSON invalide : ${raw}`)
  }
}
