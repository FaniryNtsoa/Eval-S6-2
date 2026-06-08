export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64)
}

export function ensureUniqueSlug(base: string, exists: (candidate: string) => boolean): string {
  if (!exists(base)) {
    return base
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${base}_${index}`
    if (!exists(candidate)) {
      return candidate
    }
  }

  return `${base}_${Date.now()}`
}
