type CacheEntry<T> = { value: T; expiresAt: number };

// Guardado em globalThis, não numa variável de módulo comum — mesmo bug real já encontrado em
// broadcast/runtime/output-bus.ts: uma Server Action e uma Route Handler (ou um Server Component)
// ficam em "camadas" de bundle diferentes no Next.js, e cada camada pode acabar com sua PRÓPRIA
// cópia avaliada deste módulo — um `const store = new Map()` de escopo de módulo então nunca é
// realmente compartilhado entre todos os ~27 chamadores deste cache (menu de navegação, registro
// de plugins, listagem de mídia, etc.), fazendo `getCache` praticamente nunca acertar e todo
// `setCache` ser desperdiçado. Isso explica lentidão geral crescente à medida que mais rotas (API
// route handlers, plugins) são adicionadas — mais camadas de bundle, mais cópias órfãs do cache.
// globalThis é o único objeto garantidamente compartilhado entre todas as camadas dentro do mesmo
// processo Node.
type MemoryCacheGlobal = typeof globalThis & {
  __venoreMemoryCacheStore?: Map<string, CacheEntry<unknown>>;
};

function getStore(): Map<string, CacheEntry<unknown>> {
  const globalWithStore = globalThis as MemoryCacheGlobal;
  if (!globalWithStore.__venoreMemoryCacheStore) {
    globalWithStore.__venoreMemoryCacheStore = new Map();
  }
  return globalWithStore.__venoreMemoryCacheStore;
}

export function getCache<T>(key: string): T | null {
  const store = getStore();
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  getStore().set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function invalidateCache(key: string): void {
  getStore().delete(key);
}

export function invalidateCacheByPrefix(prefix: string): void {
  const store = getStore();
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
