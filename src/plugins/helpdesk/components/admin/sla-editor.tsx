"use client";

import { useActionState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { SlaPolicyRow } from "@/plugins/helpdesk";
import { TICKET_PRIORITY_LABELS } from "@/plugins/helpdesk/shared/sla-display";
import { saveSlaPolicyAction, type HelpdeskSlaActionState } from "../../routes/admin/sla-actions";

const initialState: HelpdeskSlaActionState = { error: null };

// Editor de SLA da aba "Filas & SLA" (§2.4) — uma linha por prioridade. Prazos em HORAS (campo
// guiado, sem jargão). Fila que não configurou uma prioridade mostra o padrão corrido
// (`source: "default"`), pré-preenchido; salvar cria a política própria.
function hours(minutes: number): string {
  return String(Math.round((minutes / 60) * 100) / 100);
}

function SlaRow({ queueId, row }: { queueId: string; row: SlaPolicyRow }) {
  const [state, formAction, pending] = useActionState(saveSlaPolicyAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: `SLA de "${TICKET_PRIORITY_LABELS[row.priority]}" salvo.` });

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="queueId" value={queueId} />
      <input type="hidden" name="priority" value={row.priority} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{TICKET_PRIORITY_LABELS[row.priority]}</p>
        <p className="text-xs text-muted-foreground">
          {row.source === "default" ? "Usando o padrão do sistema" : "Política própria da fila"}
        </p>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        1ª resposta (h)
        <Input
          name="firstResponseHours"
          type="number"
          min="0.25"
          step="0.25"
          defaultValue={hours(row.firstResponseMinutes)}
          className="w-24"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Resolução (h)
        <Input
          name="resolutionHours"
          type="number"
          min="0.25"
          step="0.25"
          defaultValue={hours(row.resolutionMinutes)}
          className="w-24"
          required
        />
      </label>
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        Salvar
      </Button>
    </form>
  );
}

export function SlaEditor({
  queueId,
  queueName,
  rows,
}: {
  queueId: string;
  queueName: string;
  rows: SlaPolicyRow[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="size-4" />
          SLA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SLA — {queueName}</DialogTitle>
          <DialogDescription>
            Prazos corridos (24/7) contados da abertura do chamado. Um chamado que passa de 80 % do prazo de
            resolução entra em risco; ao estourar, fica destacado nas listas e no painel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {rows.map((row) => (
            <SlaRow key={row.priority} queueId={queueId} row={row} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
