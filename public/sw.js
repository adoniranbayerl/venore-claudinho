// Service worker da PWA.
//
// Fase 1 — instalável + tela offline:
//   - navegação (mode "navigate"): network-first; se a rede falhar, serve /offline
//     (ou a aula baixada, se houver — Fase 2).
//   - app-shell estático (/_next/static, /icons, /brand, fontes): stale-while-revalidate.
//   - resto (API, auth, mídia própria): passa direto.
// Fase 2 — aulas offline:
//   - cache "lessons-v1" preenchido sob demanda pelo componente "Baixar para offline"
//     (mensagem CACHE_URLS). Navegações em /academy/** caem nele quando offline.
//   - soundfont do abcjs (paulrosen.github.io): cache-first, pra o "Ouvir" funcionar offline
//     depois de ter tocado uma vez online.
// Fase 3 — push: handlers push + notificationclick no fim do arquivo.
//
// Pra invalidar o shell, incremente SHELL_VERSION.
const SHELL_VERSION = "v1";
const SHELL_CACHE = `shell-${SHELL_VERSION}`;
const LESSONS_CACHE = "lessons-v1";
const SOUNDFONT_CACHE = "soundfont-v1";
const SOUNDFONT_HOST = "paulrosen.github.io";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];
const OWNED_CACHES = new Set([SHELL_CACHE, LESSONS_CACHE, SOUNDFONT_CACHE]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !OWNED_CACHES.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  // "Baixar para offline" / "Remover download": o componente manda a lista de URLs e uma porta
  // de resposta (MessageChannel).
  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches
        .open(data.cacheName || LESSONS_CACHE)
        .then((cache) => Promise.all(data.urls.map((url) => cache.add(new Request(url, { cache: "reload" })))))
        .then(() => event.ports[0]?.postMessage({ ok: true }))
        .catch((error) => event.ports[0]?.postMessage({ ok: false, error: String(error) })),
    );
    return;
  }
  if (data.type === "UNCACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches
        .open(data.cacheName || LESSONS_CACHE)
        .then((cache) => Promise.all(data.urls.map((url) => cache.delete(url, { ignoreSearch: true }))))
        .then(() => event.ports[0]?.postMessage({ ok: true }))
        .catch((error) => event.ports[0]?.postMessage({ ok: false, error: String(error) })),
    );
  }
});

function isShellAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/fonts/") ||
    /\.(?:woff2?|ttf|otf)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Soundfont do abcjs (cross-origin) — cache-first pra o "Ouvir" funcionar offline.
  if (url.hostname === SOUNDFONT_HOST) {
    event.respondWith(
      caches.open(SOUNDFONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const lessons = await caches.open(LESSONS_CACHE);
        const offlineLesson = await lessons.match(request, { ignoreSearch: true });
        if (offlineLesson) return offlineLesson;
        const shell = await caches.open(SHELL_CACHE);
        return (await shell.match(OFFLINE_URL)) ?? Response.error();
      }),
    );
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
  }
});

// ---- Push notifications -------------------------------------------------------------------------
// Payload esperado (contexts/web-push): { title, body, url?, tag? }.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Nova notificação", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Nova notificação";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || undefined,
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      const existing = clientList.find((client) => "focus" in client);
      if (existing) return existing.focus().then((c) => (c && "navigate" in c ? c.navigate(target) : undefined));
      return self.clients.openWindow(target);
    }),
  );
});
