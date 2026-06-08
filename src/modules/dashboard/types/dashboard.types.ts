export interface TypeCount {
  type: string
  label: string
  count: number
  error?: string
}

export interface DashboardStats {
  assets: {
    total: number
    byType: TypeCount[]
  }
  tickets: {
    total: number
    byType: TypeCount[]
  }
  loadedAt: number
}
