import { StorageAdapter, StorageType } from './types'

/**
 * Extended storage adapter with length and key properties (like localStorage/sessionStorage)
 */
interface ExtendedStorageAdapter extends StorageAdapter {
    length: number
    key(index: number): string | null
}

/**
 * Memory storage implementation (for server-side or when storage is unavailable)
 */
class MemoryStorage implements StorageAdapter {
    private storage = new Map<string, string>()

    getItem(key: string): string | null {
        return this.storage.get(key) || null
    }

    setItem(key: string, value: string): void {
        this.storage.set(key, value)
    }

    removeItem(key: string): void {
        this.storage.delete(key)
    }

    clear(): void {
        this.storage.clear()
    }
}

/**
 * Create a storage adapter based on type
 */
export function createStorageAdapter(
    storageType: StorageType | StorageAdapter,
): StorageAdapter {
    // If it's already a custom adapter, return it
    if (typeof storageType === 'object') {
        return storageType
    }

    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined'

    switch (storageType) {
        case 'localStorage':
            if (isBrowser && window.localStorage) {
                return window.localStorage
            }
            console.warn('localStorage not available, using memory storage')
            return new MemoryStorage()

        case 'sessionStorage':
            if (isBrowser && window.sessionStorage) {
                return window.sessionStorage
            }
            console.warn('sessionStorage not available, using memory storage')
            return new MemoryStorage()

        case 'memory':
            return new MemoryStorage()

        default:
            return new MemoryStorage()
    }
}

/**
 * Storage manager with prefix support
 */
export class StorageManager {
    private adapter: StorageAdapter

    constructor(
        storageType: StorageType | StorageAdapter,
        private prefix = 'auth_',
    ) {
        this.adapter = createStorageAdapter(storageType)
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`
    }

    get(key: string): string | null {
        return this.adapter.getItem(this.getKey(key))
    }

    set(key: string, value: string): void {
        this.adapter.setItem(this.getKey(key), value)
    }

    remove(key: string): void {
        this.adapter.removeItem(this.getKey(key))
    }

    clear(): void {
        // Only clear items with our prefix
        const keysToRemove: string[] = []

        // Try to get all keys (localStorage/sessionStorage specific)
        if ('length' in this.adapter && 'key' in this.adapter) {
            const storage = this.adapter as ExtendedStorageAdapter
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i)
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach((key) => this.adapter.removeItem(key))
        } else {
            // For memory storage or custom adapters, just clear everything
            this.adapter.clear()
        }
    }

    getObject<T>(key: string): T | null {
        const value = this.get(key)
        if (!value) return null

        try {
            return JSON.parse(value) as T
        } catch {
            return null
        }
    }

    setObject<T>(key: string, value: T): void {
        this.set(key, JSON.stringify(value))
    }
}
