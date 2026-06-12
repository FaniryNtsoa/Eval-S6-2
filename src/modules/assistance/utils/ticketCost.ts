import type { GlpiTicketCost } from "@/modules/assistance/types/ticket-cost.types"

const SECONDS_PER_HOUR = 3600

/** GLPI stores cost_time as an hourly rate; duration is in seconds. */
export function computeGlpiTimeCostAmount(cost: GlpiTicketCost): number {
  const duration = cost.duration ?? 0
  const hourlyRate = cost.cost_time ?? 0
  return (duration * hourlyRate) / SECONDS_PER_HOUR
}

export function computeGlpiCostTotal(cost: GlpiTicketCost): number {
  return (
    computeGlpiTimeCostAmount(cost) +
    (cost.cost_fixed ?? 0) +
    (cost.cost_material ?? 0)
  )
}

export function sumGlpiCosts(costs: GlpiTicketCost[]): number {
  return costs.reduce((total, cost) => total + computeGlpiCostTotal(cost), 0)
}

export function sumGlpiCostBreakdown(costs: GlpiTicketCost[]) {
  return costs.reduce(
    (acc, cost) => ({
      duration: acc.duration + (cost.duration ?? 0),
      time: acc.time + computeGlpiTimeCostAmount(cost),
      fixed: acc.fixed + (cost.cost_fixed ?? 0),
      material: acc.material + (cost.cost_material ?? 0),
    }),
    { duration: 0, time: 0, fixed: 0, material: 0 },
  )
}
