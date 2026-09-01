"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type QueueOption = { id: string; name: string };

type SubmitState =
  | { phase: "form" }
  | { phase: "sending" }
  | { phase: "done"; reference: string; trackingUrl: string }
  | { phase: "error"; message: string };

// Formulário curto do quiosque (§2.5) — descrição, local, contato, nome; fila fixada pelo quiosque
// ou escolhida aqui. Envia por fetch para POST /api/helpdesk/kiosk/[token] (sem sessão — o token
// autoriza). Fotos ficaram para a Fase 8 (ver docs/chamados-plugin.md §8).
export function KioskForm({
  token,
  fixedQueue,
  queues,
  defaultLocation,
}: {
  token: string;
  fixedQueue: QueueOption | null;
  queues: QueueOption[];
  defaultLocation: string | null;
}) {
  const [state, setState] = useState<SubmitState>({ phase: "form" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ phase: "sending" });

    try {
      const response = await fetch(`/api/helpdesk/kiosk/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: String(data.get("description") ?? ""),
          location: String(data.get("location") ?? ""),
          contact: String(data.get("contact") ?? ""),
          requesterName: String(data.get("requesterName") ?? ""),
          queueId: fixedQueue ? undefined : String(data.get("queueId") ?? ""),
        }),
      });
      const body = (await response.json()) as { reference?: string; trackingPath?: string; error?: string };
      if (!response.ok || !body.reference || !body.trackingPath) {
        setState({ phase: "error", message: body.error ?? "Não foi possível enviar o chamado. Tente de novo." });
        return;
      }
      setState({
        phase: "done",
        reference: body.reference,
        trackingUrl: `${window.location.origin}${body.trackingPath}`,
      });
      form.reset();
    } catch {
      setState({ phase: "error", message: "Sem conexão. Tente novamente em instantes." });
    }
  }

  if (state.phase === "done") {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-warning" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Chamado registrado</p>
          <p className="font-mono text-xl font-semibold text-foreground">{state.reference}</p>
        </div>
        <div className="space-y-2 rounded-lg bg-muted p-3 text-left">
          <p className="text-xs text-muted-foreground">
            Acompanhe o andamento por este link (tire uma foto da tela ou anote):
          </p>
          <a href={state.trackingUrl} className="block break-all text-sm text-primary underline">
            {state.trackingUrl}
          </a>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={() => setState({ phase: "form" })}>
          Abrir outro chamado
        </Button>
      </div>
    );
  }

  const sending = state.phase === "sending";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      {state.phase === "error" && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      {!fixedQueue && (
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Para qual equipe?
          <select
            name="queueId"
            required
            defaultValue=""
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          >
            <option value="" disabled>
              Escolha uma equipe
            </option>
            {queues.map((queue) => (
              <option key={queue.id} value={queue.id}>
                {queue.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        O que está acontecendo? <span className="text-destructive">*</span>
        <Textarea
          name="description"
          required
          rows={4}
          maxLength={3000}
          placeholder="Ex.: o totem de pedido travou na tela inicial e não responde ao toque."
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Onde? (local, sala, equipamento)
        <Input name="location" maxLength={160} defaultValue={defaultLocation ?? ""} placeholder="Ex.: Recepção, Bloco A" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Seu nome (opcional)
        <Input name="requesterName" maxLength={120} placeholder="Quem está avisando" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Contato para retorno (opcional)
        <Input name="contact" maxLength={160} placeholder="Ex.: ramal 32 / WhatsApp" />
      </label>

      <Button type="submit" disabled={sending} className="w-full">
        {sending ? "Enviando..." : "Enviar chamado"}
      </Button>
    </form>
  );
}
