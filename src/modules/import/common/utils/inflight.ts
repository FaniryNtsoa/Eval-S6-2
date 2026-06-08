const inflightRequests = new Map<string, Promise<unknown>>()

export async function runOnce<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key) as Promise<T> | undefined

  if (existing) {
    return existing
  }

  const promise = task().finally(() => {
    inflightRequests.delete(key)
  })

  inflightRequests.set(key, promise)
  return promise
}
