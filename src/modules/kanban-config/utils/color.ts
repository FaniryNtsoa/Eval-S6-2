export function darkenHexColor(hex: string, amount = 0.35): string {
  const normalized = hex.replace("#", "")

  if (normalized.length !== 6) {
    return hex
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  const toChannel = (value: number) =>
    Math.max(0, Math.round(value * (1 - amount)))
      .toString(16)
      .padStart(2, "0")

  return `#${toChannel(red)}${toChannel(green)}${toChannel(blue)}`
}

export function formatBilingualLabel(labelMg: string, labelFr: string): string {
  const trimmedMg = labelMg.trim()
  const trimmedFr = labelFr.trim()

  if (!trimmedMg) {
    return trimmedFr
  }

  if (!trimmedFr) {
    return trimmedMg
  }

  return `${trimmedMg} / ${trimmedFr}`
}
