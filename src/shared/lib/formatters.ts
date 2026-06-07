export function formatDate(
  date: Date | string | number,
  locale = "fr-FR",
): string {
  const value = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value)
}

export function formatPrice(
  amount: number,
  currency = "EUR",
  locale = "fr-FR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}
