import { env } from "@/config/env"
import { IMPORT_CONCURRENCY } from "@/modules/import/common/constants"
import { PROTECTED_GLPI_USERNAMES } from "@/modules/import/common/constants/reset"
import {
  deleteItem,
  getErrorMessage,
  listPaginated,
  TRASH_ONLY_FILTER,
  tryListPaginated,
} from "@/modules/import/common/services/glpiResourceService"
import { loadAssetRegistry } from "@/modules/import/common/services/glpiSchemaRegistry"
import { buildResetTargets } from "@/modules/import/common/services/resetTargetRegistry"
import { TICKET_ENDPOINT } from "@/modules/import/ticket/constants/ticket-csv-columns"
import type { GlpiListItem } from "@/modules/import/common/types/glpi.types"
import type {
  ResetItemResult,
  ResetProgress,
  ResetReport,
} from "@/modules/import/common/types/import-result.types"
import { runConcurrent } from "@/modules/import/common/utils/runConcurrent"
import { useAuthStore } from "@/services/stores/authStore"

type ProgressCallback = (progress: ResetProgress) => void

interface DeleteTask {
  category: string
  endpoint: string
  id: number
  label: string
}

const USER_ENDPOINT = "/Administration/User"

function isProtectedUsername(username?: string): boolean {
  if (!username) {
    return true
  }

  if (username === env.glpiUsername) {
    return true
  }

  return PROTECTED_GLPI_USERNAMES.includes(
    username as (typeof PROTECTED_GLPI_USERNAMES)[number],
  )
}

function endpointCategory(endpoint: string, prefix: string): string {
  const name = endpoint.split("/").pop() ?? endpoint
  return `${prefix}-${name.toLowerCase()}`
}

interface CollectResult {
  tasks: DeleteTask[]
  errors: ResetItemResult[]
}

function dedupeById(items: GlpiListItem[]): GlpiListItem[] {
  const seen = new Set<number>()

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }

    seen.add(item.id)
    return true
  })
}

async function collectTicketCosts(tickets: GlpiListItem[]): Promise<CollectResult> {
  const tasks: DeleteTask[] = []
  const errors: ResetItemResult[] = []

  for (const ticket of tickets) {
    try {
      const costs = await listPaginated<GlpiListItem>(
        `${TICKET_ENDPOINT}/${ticket.id}/Cost`,
      )

      for (const cost of costs) {
        tasks.push({
          category: "ticket-cost",
          endpoint: `${TICKET_ENDPOINT}/${ticket.id}/Cost`,
          id: cost.id,
          label: `Coût ticket #${ticket.id} · ${cost.id}`,
        })
      }
    } catch (error) {
      errors.push({
        category: "ticket-cost",
        label: `Ticket #${ticket.id}`,
        status: "error",
        message: getErrorMessage(error),
      })
    }
  }

  return { tasks, errors }
}

async function collectTickets(): Promise<
  CollectResult & { tickets: GlpiListItem[] }
> {
  const [activeResult, trashResult] = await Promise.all([
    tryListPaginated<GlpiListItem>(TICKET_ENDPOINT),
    tryListPaginated<GlpiListItem>(TICKET_ENDPOINT, {
      filter: TRASH_ONLY_FILTER,
    }),
  ])

  if (activeResult.error && trashResult.error) {
    return {
      tasks: [],
      errors: [
        {
          category: "ticket",
          label: TICKET_ENDPOINT,
          status: "error",
          message: `Collecte impossible : ${activeResult.error}`,
        },
      ],
      tickets: [],
    }
  }

  const tickets = dedupeById([...activeResult.items, ...trashResult.items])

  return {
    tasks: tickets.map((ticket) => ({
      category: "ticket",
      endpoint: TICKET_ENDPOINT,
      id: ticket.id,
      label: ticket.name ?? String(ticket.id),
    })),
    errors: [],
    tickets,
  }
}

async function collectAssets(assetEndpoints: string[]): Promise<CollectResult> {
  const tasks: DeleteTask[] = []
  const errors: ResetItemResult[] = []

  for (const endpoint of assetEndpoints) {
    const [activeResult, trashResult] = await Promise.all([
      tryListPaginated<GlpiListItem>(endpoint),
      tryListPaginated<GlpiListItem>(endpoint, { filter: TRASH_ONLY_FILTER }),
    ])

    if (activeResult.error && trashResult.error) {
      errors.push({
        category: endpointCategory(endpoint, "asset"),
        label: endpoint,
        status: "error",
        message: `Collecte impossible : ${activeResult.error}`,
      })
      continue
    }

    const assets = dedupeById([
      ...activeResult.items,
      ...trashResult.items,
    ])

    for (const asset of assets) {
      const trashLabel = asset.is_deleted ? " (corbeille)" : ""

      tasks.push({
        category: endpointCategory(endpoint, "asset"),
        endpoint,
        id: asset.id,
        label: `${asset.name ?? asset.otherserial ?? asset.id}${trashLabel}`,
      })
    }
  }

  return { tasks, errors }
}

async function collectUsers(): Promise<CollectResult> {
  const [activeResult, trashResult] = await Promise.all([
    tryListPaginated<GlpiListItem>(USER_ENDPOINT),
    tryListPaginated<GlpiListItem>(USER_ENDPOINT, { filter: TRASH_ONLY_FILTER }),
  ])

  if (activeResult.error && trashResult.error) {
    return {
      tasks: [],
      errors: [
        {
          category: "user",
          label: USER_ENDPOINT,
          status: "error",
          message: `Collecte impossible : ${activeResult.error}`,
        },
      ],
    }
  }

  const users = dedupeById([...activeResult.items, ...trashResult.items])

  return {
    tasks: users
      .filter((user) => !isProtectedUsername(user.username))
      .map((user) => ({
        category: "user",
        endpoint: USER_ENDPOINT,
        id: user.id,
        label: user.realname ?? user.username ?? String(user.id),
      })),
    errors: [],
  }
}

async function collectDropdowns(
  dropdownEndpoints: string[],
): Promise<CollectResult> {
  const tasks: DeleteTask[] = []
  const errors: ResetItemResult[] = []

  for (const endpoint of dropdownEndpoints) {
    const [activeResult, trashResult] = await Promise.all([
      tryListPaginated<GlpiListItem>(endpoint),
      tryListPaginated<GlpiListItem>(endpoint, { filter: TRASH_ONLY_FILTER }),
    ])

    if (activeResult.error && trashResult.error) {
      errors.push({
        category: endpointCategory(endpoint, "dropdown"),
        label: endpoint,
        status: "error",
        message: `Collecte impossible : ${activeResult.error}`,
      })
      continue
    }

    const items = dedupeById([...activeResult.items, ...trashResult.items])

    for (const item of items) {
      tasks.push({
        category: endpointCategory(endpoint, "dropdown"),
        endpoint,
        id: item.id,
        label: item.name ?? String(item.id),
      })
    }
  }

  return { tasks, errors }
}

async function deleteTask(task: DeleteTask): Promise<ResetItemResult> {
  try {
    await deleteItem(task.endpoint, task.id, { force: true })

    return {
      category: task.category,
      label: task.label,
      status: "deleted",
    }
  } catch (error) {
    return {
      category: task.category,
      label: task.label,
      status: "error",
      message: getErrorMessage(error),
    }
  }
}

function buildReport(items: ResetItemResult[]): ResetReport {
  return {
    deleted: items.filter((item) => item.status === "deleted").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    errors: items.filter((item) => item.status === "error").length,
    items,
  }
}

export async function resetImportData(
  onProgress?: ProgressCallback,
): Promise<ResetReport> {
  const sessionReady = await useAuthStore.getState().ensureSession()

  if (!sessionReady) {
    throw new Error("Session expirée. Reconnectez-vous avant de réinitialiser.")
  }

  onProgress?.({
    phase: "running",
    processed: 0,
    total: 0,
    message: "Analyse des types de données GLPI…",
  })

  const registry = await loadAssetRegistry()
  const targets = buildResetTargets(registry)

  onProgress?.({
    phase: "running",
    processed: 0,
    total: 0,
    message: "Collecte des données à supprimer…",
  })

  const ticketCollection = await collectTickets()
  const ticketCostCollection = await collectTicketCosts(ticketCollection.tickets)
  const assetCollection = await collectAssets(targets.assetEndpoints)
  const userCollection = await collectUsers()
  const dropdownCollection = await collectDropdowns(targets.dropdownEndpoints)

  const collectionErrors = [
    ...ticketCollection.errors,
    ...ticketCostCollection.errors,
    ...assetCollection.errors,
    ...userCollection.errors,
    ...dropdownCollection.errors,
  ]

  const total =
    ticketCostCollection.tasks.length +
    ticketCollection.tasks.length +
    assetCollection.tasks.length +
    userCollection.tasks.length +
    dropdownCollection.tasks.length

  if (total === 0) {
    const report = buildReport(collectionErrors)

    onProgress?.({
      phase: "done",
      processed: 0,
      total: 0,
      message:
        collectionErrors.length > 0
          ? "Aucune donnée supprimée — erreurs lors de la collecte."
          : "Aucune donnée à supprimer.",
    })

    return report
  }

  const results: ResetItemResult[] = [...collectionErrors]
  let processed = 0

  const phases = [
    {
      name: "Suppression des coûts tickets…",
      tasks: ticketCostCollection.tasks,
    },
    { name: "Suppression des tickets…", tasks: ticketCollection.tasks },
    { name: "Suppression des actifs…", tasks: assetCollection.tasks },
    { name: "Suppression des utilisateurs…", tasks: userCollection.tasks },
    { name: "Suppression des références…", tasks: dropdownCollection.tasks },
  ]

  for (const phase of phases) {
    if (phase.tasks.length === 0) {
      continue
    }

    onProgress?.({
      phase: "running",
      processed,
      total,
      message: phase.name,
    })

    const phaseResults = await runConcurrent(
      phase.tasks,
      IMPORT_CONCURRENCY,
      async (task) => {
        const result = await deleteTask(task)
        processed += 1

        onProgress?.({
          phase: "running",
          processed,
          total,
          message: phase.name,
        })

        return result
      },
    )

    results.push(...phaseResults)
  }

  const report = buildReport(results)

  onProgress?.({
    phase: "done",
    processed: total,
    total,
    message: `Réinitialisation terminée : ${report.deleted} supprimés, ${report.errors} erreurs`,
  })

  return report
}
