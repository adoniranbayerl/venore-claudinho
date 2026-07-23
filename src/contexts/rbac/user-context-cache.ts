import type { UserRbacContext } from "./contracts/types";

const TTL_MS = 5 * 60 * 1000;

type CacheEntry = { value: UserRbacContext; expiresAt: number };

const cache = new Map<string, CacheEntry>();

export function getCachedUserContext(userId: string): UserRbacContext | null {
  const entry = cache.get(userId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }

  return entry.value;
}

export function setCachedUserContext(userId: string, value: UserRbacContext): void {
  cache.set(userId, { value, expiresAt: Date.now() + TTL_MS });
}

export function invalidateUserContext(userId: string): void {
  cache.delete(userId);
}
