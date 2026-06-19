import Papa from "papaparse"

import { TICKET_STATUS_LABELS } from "@/modules/assistance/constants/ticket-labels"
import type { GlpiTicketListItem } from "@/modules/assistance/types/ticket.types"
import type {
  ImportProgress,
  ImportReport,
  ImportRowResult,
} from "@/modules/import/common/types/import-result.types"
import { parseDecimal } from "@/modules/import/common/utils/parseDecimal"
import {
  cancelLastSupercost,
  fetchAllSupercosts,
  saveReopenCost,
  saveSupercost,
} from "@/modules/kanban-config/services/kanbanConfigService"
import type { TicketSupercost } from "@/modules/kanban-config/types/kanban-config.types"
import { glpiClient } from "@/services/api/client"
import { useAuthStore } from "@/services/stores/authStore"
import {
  findOneByField,
  getErrorMessage,
  patchItem,
} from "../../common/services/glpiResourceService"
import { TICKET_ENDPOINT } from "../../ticket/constants/ticket-csv-columns"

export type MvtAction = "open" | "close" | "cancel"

export const MVT_ACTION_OPTIONS: { value: MvtAction; label: string }[] = [
  { value: "open", label: "open — réouvrir" },
  { value: "close", label: "close — fermer" },
  { value: "cancel", label: "cancel — annuler le supercost" },
]

const CLOSED_STATUS_IDS = new Set([5, 6])

export interface MvtCsvRow {
  rowIndex: number
  ticketRef: string
  action: MvtAction
  value?: number
  mode?: 1 | 2 | 3 | 4
}
type ProgressCallback = (progress: ImportProgress) => void

interface ResolvedTicket {
  id: number
  statusId: number
}

let supercostCache: TicketSupercost[] | undefined

function clearSupercostCache(): void {
  supercostCache = undefined
}

async function loadSupercosts(): Promise<TicketSupercost[]> {
  if (!supercostCache) {
    supercostCache = await fetchAllSupercosts()
  }
  return supercostCache
}

function getStatusId(ticket: GlpiTicketListItem): number | undefined {
  return typeof ticket.status === "number" ? ticket.status : ticket.status?.id
}

function formatStatusLabel(statusId: number): string {
  return TICKET_STATUS_LABELS[statusId] ?? `statut ${statusId}`
}

function isClosedStatus(statusId: number): boolean {
  return CLOSED_STATUS_IDS.has(statusId)
}

function hasCancellableSupercost(
  ticketId: number,
  supercosts: TicketSupercost[],
): boolean {
  return supercosts.some(
    (entry) =>
      entry.ticketId === ticketId &&
      (entry.movementType === "SUPERCOST" || entry.movementType == null),
  )
}

function rememberSupercost(entry: TicketSupercost): void {
  if (supercostCache) {
    supercostCache.push(entry)
  }
}

function forgetLastSupercost(ticketId: number): void {
  if (!supercostCache) return

  for (let i = supercostCache.length - 1; i >= 0; i -= 1) {
    const entry = supercostCache[i]
    if (
      entry.ticketId === ticketId &&
      (entry.movementType === "SUPERCOST" || entry.movementType == null)
    ) {
      supercostCache.splice(i, 1)
      return
    }
  }
}

async function resolveTicket(ref: string): Promise<ResolvedTicket | null> {
  const ticket = await findOneByField<GlpiTicketListItem>(
    TICKET_ENDPOINT,
    "external_id",
    ref,
  )
  if (!ticket?.id) return null

  const { data } = await glpiClient.get<GlpiTicketListItem>(
    `${TICKET_ENDPOINT}/${ticket.id}`,
  )
  const statusId = getStatusId(data)

  if (statusId == null) {
    throw new Error(`Impossible de lire le statut du ticket "${ref}"`)
  }

  return { id: ticket.id, statusId }
}

function validateMovement(
  action: MvtAction,
  ticketRef: string,
  statusId: number,
  ticketId: number,
  supercosts: TicketSupercost[],
  value?: number,
): void {
  const statusLabel = formatStatusLabel(statusId)

  if (action === "open") {
    if (!isClosedStatus(statusId)) {
      throw new Error(
        `Impossible de rouvrir le ticket "${ticketRef}" : statut actuel « ${statusLabel} » (déjà ouvert ou en cours)`,
      )
    }
    if (value != null && value > 0 && !hasCancellableSupercost(ticketId, supercosts)) {
      throw new Error(
        `Impossible de rouvrir le ticket "${ticketRef}" : aucun supercost de référence (fermez d'abord avec un coût)`,
      )
    }
    return
  }

  if (action === "close") {
    if (isClosedStatus(statusId)) {
      throw new Error(
        `Impossible de fermer le ticket "${ticketRef}" : déjà fermé (« ${statusLabel} »)`,
      )
    }
    return
  }

  if (!isClosedStatus(statusId)) {
    throw new Error(
      `Impossible d'annuler le supercost du ticket "${ticketRef}" : le ticket est en cours (« ${statusLabel} »)`,
    )
  }

  if (!hasCancellableSupercost(ticketId, supercosts)) {
    throw new Error(
      `Impossible d'annuler le supercost du ticket "${ticketRef}" : aucun supercost à annuler (déjà annulé ou jamais enregistré)`,
    )
  }
}

function parseAction(raw: string): MvtAction | null{
    const action = raw.trim().toLowerCase()
    if(action ==="open" || action ==="close" || action ==="cancel"){
        return action 
    }
    return null
}

function isHeaderRow(cells:string[]): boolean{
    const first  = cells[0]?.trim().toLowerCase() ?? ""
    return first === "ticket" || first  === "ref_ticket"
}

function parseMode(raw?: string): 1 | 2 | 3 | 4 {
  const mode = Number.parseInt(raw?.trim() ?? "1", 10)
  if (![1, 2, 3, 4].includes(mode)) {
    throw new Error("Mode invalide (1..4)")
  }
  return mode as 1 | 2 | 3 | 4
}

// ─────────────────────────────────────────────
// 1. LA FONCTION MÉTIER (source de vérité)
// a = ticket, b = mvt, c = valeur (optionnel pour cancel), d = mode (open uniquement)
// ─────────────────────────────────────────────
export async function traiter(
  a: string,
  b: string,
  c?: string,
  d?: string,
): Promise<{ ticketId: number; message: string }> {
  const sessionReady = await useAuthStore.getState().ensureSession()
  if (!sessionReady) {
    throw new Error("Session expirée. Reconnectez-vous.")
  }
  const ticketRef = a.trim()
  const action = parseAction(b)

  if (!ticketRef) throw new Error("Ticket requis")
  if (!action) throw new Error("Mvt inconnu (open, close, cancel)")
  let value: number | undefined
  let mode: 1 | 2 | 3 | 4 = 1
  if (action !== "cancel") {
    if (!c?.trim()) throw new Error(`Valeur requise pour ${action}`)
    value = parseDecimal(c.trim(), "valeur")
  }
  if (action === "open" && d?.trim()) {
    mode = parseMode(d)
  }
  const ticket = await resolveTicket(ticketRef)
  if (!ticket) {
    throw new Error(`Ticket ref "${ticketRef}" introuvable`)
  }

  const supercosts = await loadSupercosts()
  validateMovement(action, ticketRef, ticket.statusId, ticket.id, supercosts, value)

  const ticketId = ticket.id
  if (action === "open") {
    await patchItem(TICKET_ENDPOINT, ticketId, { status: { id: 2 } })
    if (value != null && value > 0) {
      const reopenEntry = await saveReopenCost({ ticketId, percentage: value, mode })
      rememberSupercost(reopenEntry)
      console.log(mode.toString)
    }
  } else if (action === "close") {
    await patchItem(TICKET_ENDPOINT, ticketId, { status: { id: 6 } })
    if (value != null && value >= 0) {
      const supercostEntry = await saveSupercost({ ticketId, amount: value })
      rememberSupercost(supercostEntry)
    }
  } else {
    await cancelLastSupercost(ticketId)
    forgetLastSupercost(ticketId)
  }
  return {
    ticketId,
    message: `OK : ${ticketRef} · ${action}`,
  }
}

export function parseMvtCsv(content: string): MvtCsvRow[] {
    const parsed =  Papa.parse<string[]>(content,{
        header:false,
        skipEmptyLines:true
    })
    if(parsed.errors.length>0){
        throw new Error(parsed.errors[0].message)
    }
    const rows: MvtCsvRow[] = []

    parsed.data.forEach((cells,index)=>{
        if(!cells || cells.length === 0) return
        if (index ===0 && isHeaderRow(cells) ) return
        const ticketRef = cells[0]?.trim() ?? ""
        const actionRaw = cells[1]?.trim() ?? ""
        const valueRaw = cells[2]?.trim()
        const modeRaw = cells[3]?.trim()

        const rowIndex = index + 1
        const action = parseAction(actionRaw)

        if (!ticketRef) throw new Error(`Ligne ${rowIndex}: ticket requis`)
        if (!action) throw new Error(`Ligne ${rowIndex}: mvt inconnu`)

        let value: number | undefined
        let mode: 1 | 2 | 3 | 4 | undefined

        if (action !== "cancel") {
          if (!valueRaw) throw new Error(`Ligne ${rowIndex}: valeur requise pour ${action}`)
          value = parseDecimal(valueRaw, "valeur")
        }
        if (action === "open" && modeRaw) {
          mode = parseMode(modeRaw)
        }
        rows.push({ rowIndex, ticketRef, action, value, mode })

    })
    return rows
}

export function parseMvtCsvFile(file: File): Promise<MvtCsvRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
  
      reader.onload = () => {
        try {
          const content = String(reader.result ?? "")
          resolve(parseMvtCsv(content))
        } catch (error) {
          reject(error)
        }
      }
  
      reader.onerror = () => {
        reject(new Error("Impossible de lire le fichier CSV"))
      }
  
      reader.readAsText(file)
    })
  }

// ─────────────────────────────────────────────
// Import CSV : chaque ligne appelle traiter
// ─────────────────────────────────────────────
async function importRow(row: MvtCsvRow): Promise<ImportRowResult> {
  try {
    const { ticketId, message } = await traiter(
      row.ticketRef,
      row.action,
      row.value?.toString(),
      row.mode?.toString(),
      
    )
    return {
      rowIndex: row.rowIndex,
      status: "updated",
      identifier: `${row.ticketRef} · ${row.action}`,
      glpiId: ticketId,
      message,
    }
  } catch (error) {
    return {
      rowIndex: row.rowIndex,
      status: "error",
      identifier: row.ticketRef,
      message: getErrorMessage(error),
    }
  }
}

  function buildReport(rows:ImportRowResult[],totalRows:number):ImportReport{
    return{
        totalRows,
        created:0,
        updated:rows.filter((r)=>r.status === "updated").length,
        errors:rows.filter((r) => r.status ==="error").length,
        rows,
    }
  }
  export async function importMvtCsvRows(
    rows:MvtCsvRow[],
    onProgress?:ProgressCallback,
  ):Promise<{report: ImportReport}>{
    const sessionReady = await useAuthStore.getState().ensureSession()
  if (!sessionReady) {
    throw new Error("Session expirée. Reconnectez-vous.")
  }

  clearSupercostCache()
  try {
    supercostCache = await fetchAllSupercosts()

    onProgress?.({
      phase: "importing",
      currentChunk: 1,
      totalChunks: 1,
      processedRows: 0,
      totalRows: rows.length,
      message: "Import des mouvements…",
    })
    const results: ImportRowResult[] = []
    for (let i = 0; i < rows.length; i++) {
      results.push(await importRow(rows[i]))
      onProgress?.({
        phase: "importing",
        currentChunk: 1,
        totalChunks: 1,
        processedRows: i + 1,
        totalRows: rows.length,
        message: `Ligne ${i + 1}/${rows.length}`,
      })
    }
    onProgress?.({
      phase: "done",
      currentChunk: 1,
      totalChunks: 1,
      processedRows: rows.length,
      totalRows: rows.length,
      message: "Import terminé",
    })
    return { report: buildReport(results, rows.length) }
  } finally {
    clearSupercostCache()
  }
  }