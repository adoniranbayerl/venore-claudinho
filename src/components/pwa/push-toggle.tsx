"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { savePushSubscriptionAction, deletePushSubscriptionAction } from "./push-actions";

// Toggle opt-in de notificações push. Nada de pedir permissão automático — só quando o usuário
// clica em "Ativar". Depende de:
//  - service worker registrado (public/sw.js — ServiceWorkerRegistrar, só em produção)
//  - NEXT_PUBLIC_VAPID_PUBLIC_KEY no ambiente
//  - navegador com PushManager (todos os modernos; iOS só quando instalado na tela inicial)
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "unsupported" | "loading" | "off" | "on" | "denied";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Detecção depende de APIs do browser — roda fora do corpo do efeito (setTimeout) pra não ser
    // um setState síncrono.
    const id = window.setTimeout(() => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window &&
        Boolean(VAPID_PUBLIC);
      if (!supported) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setState(sub ? "on" : "off"))
        .catch(() => setState("off"));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!),
      });
      const json = sub.toJSON();
      const result = await savePushSubscriptionAction({
        endpoint: json.endpoint ?? sub.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
        userAgent: navigator.userAgent,
      });
      if (result.error) {
        await sub.unsubscribe().catch(() => undefined);
        toast.error(result.error);
        setState("off");
        return;
      }
      setState("on");
      toast.success("Avisos ativados neste aparelho.");
    } catch {
      toast.error("Não consegui ativar os avisos neste navegador.");
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscriptionAction(sub.endpoint);
        await sub.unsubscribe().catch(() => undefined);
      }
      setState("off");
    } catch {
      toast.error("Não consegui desativar os avisos.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-panel border border-border bg-card p-3 text-sm">
      <div className="flex items-center gap-2.5 text-foreground">
        {state === "on" ? (
          <Bell className="size-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <BellOff className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span>
          {state === "on"
            ? "Avisos de mensagem ativados neste aparelho."
            : state === "denied"
              ? "Avisos bloqueados nas configurações do navegador."
              : "Receber aviso quando houver mensagem nova."}
        </span>
      </div>
      {state === "on" ? (
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={disable}>
          Desativar
        </Button>
      ) : state === "off" ? (
        <Button type="button" size="sm" disabled={busy} onClick={enable}>
          Ativar
        </Button>
      ) : null}
    </div>
  );
}
