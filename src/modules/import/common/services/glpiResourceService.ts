import axios from "axios"

import { env } from "@/config/env"
import { glpiClient } from "@/services/api/client"
import { GLPI_PAGE_SIZE } from "@/modules/import/common/constants"
import type {
  GlpiCreateResponse,
  GlpiListItem,
} from "@/modules/import/common/types/glpi.types"
import { buildRsqlAnd, buildRsqlEquals } from "@/modules/import/common/utils/rsql"

const ACTIVE_ONLY_FILTER = "is_deleted==0"
const TRASH_ONLY_FILTER = "is_deleted==1"

export async function listPaginated<T extends { id: number }>(
  endpoint: string,
  options?: { filter?: string },
): Promise<T[]> {
  const items: T[] = []
  let start = 0

  while (true) {
    const { data } = await glpiClient.get<T[]>(endpoint, {
      params: {
        start,
        limit: GLPI_PAGE_SIZE,
        ...(options?.filter ? { filter: options.filter } : {}),
      },
    })

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    items.push(...data)

    if (data.length < GLPI_PAGE_SIZE) {
      break
    }

    start += GLPI_PAGE_SIZE
  }

  return items
}

export async function tryListPaginated<T extends { id: number }>(
  endpoint: string,
  options?: { filter?: string },
): Promise<{ items: T[]; error?: string }> {
  try {
    const items = await listPaginated<T>(endpoint, options)
    return { items }
  } catch (error) {
    return { items: [], error: getErrorMessage(error) }
  }
}

export async function deleteItem(
  endpoint: string,
  id: number,
  options?: { force?: boolean },
): Promise<void> {
  await glpiClient.delete(`${endpoint}/${id}`, {
    params: options?.force ? { force: true } : undefined,
  })
}

export { ACTIVE_ONLY_FILTER, TRASH_ONLY_FILTER }

export async function listAll<T extends GlpiListItem>(
  endpoint: string,
  labelField: keyof T = "name" as keyof T,
): Promise<T[]> {
  const items: T[] = []
  let start = 0

  while (true) {
    const { data } = await glpiClient.get<T[]>(endpoint, {
      params: { start, limit: GLPI_PAGE_SIZE },
    })

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    items.push(...data)

    if (data.length < GLPI_PAGE_SIZE) {
      break
    }

    start += GLPI_PAGE_SIZE
  }

  return items.filter((item) => {
    const label = item[labelField]
    return typeof label === "string" && label.trim().length > 0
  })
}

export async function findOneByField<T extends GlpiListItem>(
  endpoint: string,
  field: string,
  value: string,
  options?: { activeOnly?: boolean },
): Promise<T | null> {
  const filters = [buildRsqlEquals(field, value)]

  if (options?.activeOnly) {
    filters.push(ACTIVE_ONLY_FILTER)
  }

  const { data } = await glpiClient.get<T[]>(endpoint, {
    params: {
      filter: buildRsqlAnd(...filters),
      limit: 1,
    },
  })

  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function createItem(
  endpoint: string,
  payload: object,
): Promise<GlpiCreateResponse> {
  const { data } = await glpiClient.post<GlpiCreateResponse>(endpoint, payload)

  if (!data?.id) {
    const errorBody = data as { title?: string; detail?: string; status?: string }
    throw new Error(
      errorBody.detail ??
        errorBody.title ??
        errorBody.status ??
        "Réponse GLPI invalide lors de la création",
    )
  }

  return data
}

export async function patchItem(
  endpoint: string,
  id: number,
  payload: object,
): Promise<void> {
  await glpiClient.patch(`${endpoint}/${id}`, payload)
}

export async function fetchOpenApiSpec() {
  const { data } = await axios.get(`${env.glpiApiUrl}/doc.json`, {
    headers: { Accept: "application/json" },
  })

  return data
}

function formatGlpiErrorBody(data: unknown): string | undefined {
  if (Array.isArray(data)) {
    const [, message] = data
    return typeof message === "string" ? message : data.join(" · ")
  }

  if (data && typeof data === "object") {
    const body = data as {
      detail?: string
      title?: string
      message?: string
    }

    return body.detail ?? body.title ?? body.message
  }

  return undefined
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const formatted = formatGlpiErrorBody(error.response?.data)
    return formatted ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Erreur inconnue"
}
