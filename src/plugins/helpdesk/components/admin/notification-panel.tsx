"use client";

import Link from "next/link";
import { Bell, BellRing, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useHelpdeskNotifications } from "../notifications-client";

// Aba Notificações do /admin/helpdesk (§2.3). Lista as últimas N do ator, com polling ~30 s e o
// aviso do browser (via useHelpdeskNotifications). Cada linha abre o chamado no drawer da aba Fila.

function when(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// `ticketHrefBase` recebe o ticketId concatenado — no admin abre o drawer da aba Fila; no app do
// técnico aponta pra dentro do próprio app.
export function NotificationPanel({
  ticketHrefBase = "/admin/helpdesk?tab=fila&ticket=",
}: {
  ticketHrefBase?: string;
}) {
  const { notifications, unreadCount, permission, requestBrowserPermission, markRead } = useHelpdeskNotifications();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {permission === "default" && (
            <Button variant="outline" size="sm" onClick={() => void requestBrowserPermission()}>
              <BellRing className="size-4" />
              Ativar avisos do navegador
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => void markRead()}
          >
            <Check className="size-4" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Nenhuma notificação" description="Você será avisado quando um chamado das suas filas mudar." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <Link
                href={`${ticketHrefBase}${notification.ticketId}`}
                onClick={() => {
                  if (notification.readAt === null) void markRead([notification.id]);
                }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bell className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm text-foreground">{notification.summary}</span>
                    {notification.readAt === null && <Badge variant="default">nova</Badge>}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{when(notification.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
