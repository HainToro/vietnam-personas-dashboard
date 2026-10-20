interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const MAX_ENTRIES = 100;
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const entries = new Map<string, CacheEntry<unknown>>();

export function getCachedQuery<T>(key: string): T | null {
  const entry = entries.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return null;
  }

  entries.delete(key);
  entries.set(key, entry);
  return entry.value as T;
}

export function setCachedQuery<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  entries.delete(key);
  entries.set(key, { value, expiresAt: Date.now() + ttlMs });

  while (entries.size > MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value;
    if (oldestKey === undefined) break;
    entries.delete(oldestKey);
  }
}
