import {
  ACTIVE_ONLY_FILTER,
  tryListPaginated,
} from "@/modules/import/common/services/glpiResourceService"
import {
  isImportableAsset,
  loadAssetRegistry,
} from "@/modules/import/common/services/glpiSchemaRegistry"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import { IMPORT_CONCURRENCY } from "@/modules/import/common/constants"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import {
  formatItemTypeLabel,
  TICKET_TYPE_LABELS,
} from "@/modules/assistance/constants/ticket-labels"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import type { DashboardStats, TypeCount } from "@/modules/dashboard/types/dashboard.types"

async function countAssetsByType(): Promise<TypeCount[]> {
  const registry = await loadAssetRegistry()
  const entries = [...registry.assets.values()].filter(isImportableAsset)

  const results = await runConcurrent(
    entries,
    IMPORT_CONCURRENCY,
    async (entry) => {
      const { items, error } = await tryListPaginated<{ id: number }>(
        entry.assetEndpoint,
        { filter: ACTIVE_ONLY_FILTER },
      )

      return {
        type: entry.itemType,
        label: formatItemTypeLabel(entry.itemType),
        count: items.length,
        error,
      } satisfies TypeCount
    },
  )

  return results.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

async function countTicketsByType(): Promise<TypeCount[]> {
  const { items, error } = await tryListPaginated<GlpiTicketListItem>(
    TICKET_ENDPOINT,
    { filter: ACTIVE_ONLY_FILTER },
  )

  if (error) {
    return Object.entries(TICKET_TYPE_LABELS).map(([typeId, label]) => ({
      type: typeId,
      label,
      count: 0,
      error,
    }))
  }

  const counts = new Map<number, number>()

  for (const ticket of items) {
    const typeId =
      typeof ticket.type === "number" ? ticket.type : ticket.type?.id

    if (typeId != null) {
      counts.set(typeId, (counts.get(typeId) ?? 0) + 1)
    }
  }

  const byType: TypeCount[] = Object.entries(TICKET_TYPE_LABELS).map(
    ([typeId, label]) => ({
      type: typeId,
      label,
      count: counts.get(Number(typeId)) ?? 0,
    }),
  )

  for (const [typeId, count] of counts) {
    if (!TICKET_TYPE_LABELS[typeId]) {
      byType.push({
        type: String(typeId),
        label: `Type ${typeId}`,
        count,
      })
    }
  }

  return byType.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [assetsByType, ticketsByType] = await Promise.all([
    countAssetsByType(),
    countTicketsByType(),
  ])

  return {
    assets: {
      total: assetsByType.reduce((sum, item) => sum + item.count, 0),
      byType: assetsByType,
    },
    tickets: {
      total: ticketsByType.reduce((sum, item) => sum + item.count, 0),
      byType: ticketsByType,
    },
    loadedAt: Date.now(),
  }
}
