import axios from "axios"

import { env } from "@/config/env"
import { DEFAULT_KANBAN_CONFIG } from "@/modules/kanban-config/constants/defaults"
import type {
  AddKanbanLanguageInput,
  KanbanConfig,
  UpdateKanbanConfigInput,
} from "@/modules/kanban-config/types/kanban-config.types"

const kanbanConfigClient = axios.create({
  baseURL: env.kanbanConfigApiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

export async function fetchKanbanConfig(): Promise<KanbanConfig> {
  try {
    const { data } = await kanbanConfigClient.get<KanbanConfig>("")
    return data
  } catch {
    return DEFAULT_KANBAN_CONFIG
  }
}

export async function updateKanbanConfig(
  input: UpdateKanbanConfigInput,
): Promise<KanbanConfig> {
  const { data } = await kanbanConfigClient.put<KanbanConfig>("", input)
  return data
}

export async function addKanbanLanguage(
  input: AddKanbanLanguageInput,
): Promise<KanbanConfig> {
  const { data } = await kanbanConfigClient.post<KanbanConfig>(
    "/languages",
    input,
  )
  return data
}

export async function removeKanbanLanguage(code: string): Promise<KanbanConfig> {
  const { data } = await kanbanConfigClient.delete<KanbanConfig>(
    `/languages/${encodeURIComponent(code)}`,
  )
  return data
}
