"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HelpdeskNotificationView } from "@/plugins/helpdesk";

// Cliente compartilhado das notificações in-app (§2.3) — usado pelo painel da aba Notificações do
// admin e pelo sino do app do técnico. Faz polling em GET /api/helpdesk/notifications a cada ~30 s
// e, com a aba aberta e permissão concedida, dispara `new Notification(...)` do browser para as
// não lidas que chegaram desde o último ciclo. Sem service worker / push com a aba fechada — isso
// é Fase 8.

const POLL_MS = 30_000;

type Feed = { notifications: HelpdeskNotificationView[]; unreadCount: number };

type BrowserPermission = "unsupported" | "default" | "granted" | "denied";

function readPermission(): BrowserPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as BrowserPermission;
}

function parseFeed(raw: unknown): Feed {
  const value = raw as { notifications?: unknown; unreadCount?: unknown };
  const list = Array.isArray(value?.notifications) ? (value.notifications as HelpdeskNotificationView[]) : [];
  const notifications = list.map((n) => ({ ...n, createdAt: new Date(n.createdAt), readAt: n.readAt ? new Date(n.readAt) : null }));
  return { notifications, unreadCount: typeof value?.unreadCount === "number" ? value.unreadCount : 0 };
}

export function useHelpdeskNotifications() {
  const [feed, setFeed] = useState<Feed>({ notifications: [], unreadCount: 0 });
  const [permission, setPermission] = useState<BrowserPermission>("unsupported");
  const seenIds = useRef<Set<string> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/helpdesk/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const next = parseFeed(await res.json());
      setFeed(next);

      // Dispara o aviso do browser só para as não lidas novas (não no primeiro carregamento, pra
      // não repetir tudo que já estava lá).
      if (seenIds.current === null) {
        seenIds.current = new Set(next.notifications.map((n) => n.id));
      } else if (readPermission() === "granted") {
        for (const n of next.notifications) {
          if (n.readAt === null && !seenIds.current.has(n.id)) {
            try {
              new Notification("Chamados", { body: n.summary, tag: `helpdesk-${n.id}` });
            } catch {
              /* alguns browsers exigem gesto do usuário — ignora silenciosamente */
            }
          }
          seenIds.current.add(n.id);
        }
      } else {
        for (const n of next.notifications) seenIds.current.add(n.id);
      }
    } catch {
      /* rede caiu no meio do polling — tenta de novo no próximo ciclo */
    }
  }, []);

  useEffect(() => {
    // Deferido pra fora do corpo síncrono do efeito: o valor real de Notification.permission e o
    // primeiro feed só existem no client, e ler/setar no render inicial quebraria a hidratação.
    queueMicrotask(() => {
      setPermission(readPermission());
      void refresh();
    });
    const timer = setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as BrowserPermission);
    } catch {
      /* ignora */
    }
  }, []);

  const markRead = useCallback(
    async (ids?: string[]) => {
      try {
        await fetch("/api/helpdesk/notifications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(ids && ids.length > 0 ? { ids } : {}),
        });
      } catch {
        /* ignora — o próximo refresh reconcilia */
      }
      await refresh();
    },
    [refresh],
  );

  return {
    notifications: feed.notifications,
    unreadCount: feed.unreadCount,
    permission,
    requestBrowserPermission,
    markRead,
    refresh,
  };
}
