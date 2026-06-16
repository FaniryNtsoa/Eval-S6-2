import Papa from "papaparse"
import type{ImportProgress, ImportReport, ImportRowResult} from "@/modules/import/common/types/import-result.types"
import { findOneByField, getErrorMessage, patchItem } from "../../common/services/glpiResourceService";
import type { GlpiListItem } from "../../common/types/glpi.types";
import { useAuthStore } from "@/services/stores/authStore"
import { TICKET_ENDPOINT } from "../../ticket/constants/ticket-csv-columns";
import {parseDecimal} from "@/modules/import/common/utils/parseDecimal"
import { cancelLastSupercost, saveReopenCost, saveSupercost } from "@/modules/kanban-config/services/kanbanConfigService";
export type MvtAction = "open" | "close" | "cancel"

export interface MvtCsvRow{
    rowIndex: number
    ticketRef: string
    action : MvtAction 
    value?:number
}
type ProgressCallback = (progress:ImportProgress)=>void

async function resolveTicketId(ref:string):Promise<number | null>{
    const ticket = await findOneByField<GlpiListItem>(
        TICKET_ENDPOINT,
        "external_id",
        ref,
    )
    return ticket?.id ?? null
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

// ─────────────────────────────────────────────
// 1. LA FONCTION MÉTIER (source de vérité)
// a = ticket, b = mvt, c = valeur (optionnel pour cancel)
// ─────────────────────────────────────────────
export async function traiter(
  a: string,
  b: string,
  c?: string,
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
  if (action !== "cancel") {
    if (!c?.trim()) throw new Error(`Valeur requise pour ${action}`)
    value = parseDecimal(c.trim(), "valeur")
  }
  const ticketId = await resolveTicketId(ticketRef)
  if (!ticketId) {
    throw new Error(`Ticket ref "${ticketRef}" introuvable`)
  }
  if (action === "open") {
    await patchItem(TICKET_ENDPOINT, ticketId, { status: { id: 2 } })
    if (value != null && value > 0) {
      await saveReopenCost({ ticketId, percentage: value })
    }
  } else if (action === "close") {
    await patchItem(TICKET_ENDPOINT, ticketId, { status: { id: 6 } })
    if (value != null && value > 0) {
      await saveSupercost({ ticketId, amount: value })
    }
  } else {
    await cancelLastSupercost(ticketId)
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
        
        const rowIndex = index + 1
        const action = parseAction(actionRaw)

        if(!ticketRef) throw new Error (`Ligne ${rowIndex}:ticket requis`)
        if(!action) throw new Error (`Ligne ${rowIndex}:mvt inconnu`)

        let value : number | undefined

        if (action !== "cancel"){
            if(!valueRaw) throw new Error(`Ligne ${rowIndex}:valeur requise pour ${action}`)
                value = parseDecimal(valueRaw,"valeur")
        }
        rows.push({rowIndex,ticketRef,action,value})

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

  // async function applyMovement(ticketId:number, row: MvtCsvRow,):Promise<string | undefined>{
  //   if(row.action === "open"){
  //       await patchItem(TICKET_ENDPOINT,ticketId, {status:{id:2}})
  //       if (row.value !=null && row.value>0){
  //           await saveReopenCost({ticketId, percentage:row.value})
  //       }
  //       return undefined
  //   }
  //   if(row.action === "close"){
  //       await patchItem(TICKET_ENDPOINT,ticketId, {status:{id:6}})
  //       if (row.value !=null && row.value>0){
  //           await saveSupercost({ticketId, amount:row.value})
  //       }
  //       return undefined
  //   }
  //   await cancelLastSupercost(ticketId)
  //   return undefined
  // }

// ─────────────────────────────────────────────
// Import CSV : chaque ligne appelle traiter
// ─────────────────────────────────────────────
async function importRow(row: MvtCsvRow): Promise<ImportRowResult> {
  try {
    const { ticketId, message } = await traiter(
      row.ticketRef,
      row.action,
      row.value?.toString(),
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
  }