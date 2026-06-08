import type {
  ElementListItem,
  ElementSearchCriteria,
} from "@/modules/inventory/types/element.types"
import { resolveElementRefName } from "@/modules/inventory/utils/elementField"

function matchesQuery(element: ElementListItem, query: string): boolean {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return (
    String(element.id).includes(normalized) ||
    (element.name?.toLowerCase().includes(normalized) ?? false) ||
    (element.inventoryNumber?.toLowerCase().includes(normalized) ?? false) ||
    element.itemTypeLabel.toLowerCase().includes(normalized) ||
    resolveElementRefName(element.status).toLowerCase().includes(normalized) ||
    resolveElementRefName(element.location).toLowerCase().includes(normalized) ||
    resolveElementRefName(element.manufacturer)
      .toLowerCase()
      .includes(normalized) ||
    resolveElementRefName(element.model).toLowerCase().includes(normalized) ||
    resolveElementRefName(element.user).toLowerCase().includes(normalized)
  )
}

export function filterElements(
  elements: ElementListItem[],
  criteria: ElementSearchCriteria,
): ElementListItem[] {
  return elements.filter((element) => {
    if (criteria.itemType && element.itemType !== criteria.itemType) {
      return false
    }

    if (
      criteria.status &&
      resolveElementRefName(element.status) !== criteria.status
    ) {
      return false
    }

    if (
      criteria.location &&
      resolveElementRefName(element.location) !== criteria.location
    ) {
      return false
    }

    if (
      criteria.manufacturer &&
      resolveElementRefName(element.manufacturer) !== criteria.manufacturer
    ) {
      return false
    }

    if (criteria.user && resolveElementRefName(element.user) !== criteria.user) {
      return false
    }

    return matchesQuery(element, criteria.query)
  })
}

export function collectUniqueValues(
  elements: ElementListItem[],
  selector: (element: ElementListItem) => string,
): string[] {
  const values = new Set<string>()

  for (const element of elements) {
    const value = selector(element).trim()

    if (value) {
      values.add(value)
    }
  }

  return [...values].sort((a, b) => a.localeCompare(b, "fr"))
}
