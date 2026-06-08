export function parseFrenchDateTime(date: string, time: string): string {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim())
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim())

  if (!dateMatch) {
    throw new Error(`Date invalide (attendu DD/MM/YYYY) : ${date}`)
  }

  if (!timeMatch) {
    throw new Error(`Heure invalide (attendu HH:mm) : ${time}`)
  }

  const day = Number.parseInt(dateMatch[1], 10)
  const month = Number.parseInt(dateMatch[2], 10)
  const year = Number.parseInt(dateMatch[3], 10)
  const hours = Number.parseInt(timeMatch[1], 10)
  const minutes = Number.parseInt(timeMatch[2], 10)

  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new Error(`Date invalide : ${date}`)
  }

  return parsed.toISOString()
}
