"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHelpdeskNotifications } from "../notifications-client";

// Sino do app do técnico (§2.3, §4) — badge com o contador de não lidas, polling ~30 s e aviso do
// browser (useHelpdeskNotifications). Toca um painel embaixo, largura cheia (mobile-first), em vez
// de um dropdown estreito. Cada linha leva ao detalhe do chamado dentro do próprio app.

function when(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function NotificationBell({ basePath = "/chamados/tecnico" }: { basePath?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, permission, requestBrowserPermission, markRead } = useHelpdeskNotifications();

  function openTicket(ticketId: string, notificationId: string, unread: boolean) {
    if (unread) void markRead([notificationId]);
    setOpen(false);
    router.push(`${basePath}?tab=minhas&ticket=${ticketId}`);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <span className="text-sm font-medium text-foreground">Notificações</span>
            <div className="flex items-center gap-1">
              {permission === "default" && (
                <Button variant="ghost" size="sm" onClick={() => void requestBrowserPermission()} aria-label="Ativar avisos do navegador">
                  <BellRing className="size-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" disabled={unreadCount === 0} onClick={() => void markRead()}>
                <Check className="size-4" />
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => openTicket(notification.ticketId, notification.id, notification.readAt === null)}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-muted/60"
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        notification.readAt === null ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-foreground">{notification.summary}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{when(notification.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
