export class ReferenceCache {
  private readonly stores = new Map<string, Map<string, number>>()
  private readonly assetKeys = new Set<string>()

  get(namespace: string, key: string): number | undefined {
    return this.stores.get(namespace)?.get(key)
  }

  set(namespace: string, key: string, id: number): void {
    const store = this.stores.get(namespace) ?? new Map<string, number>()
    store.set(key, id)
    this.stores.set(namespace, store)
  }

  has(namespace: string, key: string): boolean {
    return this.stores.get(namespace)?.has(key) ?? false
  }

  getAssetKey(itemType: string, otherserial: string): string | undefined {
    const key = `${itemType}:${otherserial}`
    return this.assetKeys.has(key) ? key : undefined
  }

  setAsset(itemType: string, otherserial: string, id: number): void {
    this.assetKeys.add(`${itemType}:${otherserial}`)
    this.set(`asset:${itemType}`, otherserial, id)
  }

  getAssetId(itemType: string, otherserial: string): number | undefined {
    return this.get(`asset:${itemType}`, otherserial)
  }

  namespaceSize(namespace: string): number {
    return this.stores.get(namespace)?.size ?? 0
  }
}
