"use client";

import { useActionState } from "react";
import { Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — mesmo racional de
// scenes-section.tsx.
import type { BroadcastAgendaEventRecord, BroadcastAgendaRecord } from "@/plugins/broadcast/contracts/types";
import {
  createAgendaAction,
  createAgendaEventAction,
  deleteAgendaAction,
  deleteAgendaEventAction,
  updateAgendaAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };
const DEFAULT_AGENDA_COLOR = "#0f0f0f";

function CreateAgendaForm() {
  const [state, formAction, pending] = useActionState(createAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda criada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="agenda-name">Nome</label>
        <Input id="agenda-name" name="name" placeholder="Semanal, Mensal, Faculdade..." required className="w-56" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="agenda-duration">Segundos na tela antes de trocar</label>
        <Input id="agenda-duration" name="displaySeconds" type="number" placeholder="20" className="w-32" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="agenda-color">Cor de fundo na TV</label>
        <input
          id="agenda-color"
          name="backgroundColor"
          type="color"
          defaultValue={DEFAULT_AGENDA_COLOR}
          className="h-9 w-16 cursor-pointer rounded-md border border-border"
        />
      </div>
      <Button type="submit" disabled={pending}>Nova agenda</Button>
    </form>
  );
}

function EditAgendaForm({ agenda }: { agenda: BroadcastAgendaRecord }) {
  const [state, formAction, pending] = useActionState(updateAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda atualizada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border/60 bg-muted/30 p-2">
      <input type="hidden" name="agendaId" value={agenda.id} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${agenda.id}-edit-name`}>Nome</label>
        <Input id={`${agenda.id}-edit-name`} name="name" defaultValue={agenda.name} required className="w-48" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${agenda.id}-edit-duration`}>Segundos na tela</label>
        <Input
          id={`${agenda.id}-edit-duration`}
          name="displaySeconds"
          type="number"
          defaultValue={agenda.displaySeconds}
          className="w-28"
        />
      </div>
      <div className="space-y-1">
        <label className="flex items-center gap-1 text-xs text-muted-foreground" htmlFor={`${agenda.id}-edit-color`}>
          <Palette className="size-3" aria-hidden="true" /> Cor de fundo
        </label>
        <input
          id={`${agenda.id}-edit-color`}
          name="backgroundColor"
          type="color"
          defaultValue={agenda.backgroundColor ?? DEFAULT_AGENDA_COLOR}
          className="h-9 w-16 cursor-pointer rounded-md border border-border"
        />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>Salvar</Button>
    </form>
  );
}

function DeleteAgendaButton({ agendaId }: { agendaId: string }) {
  const [state, formAction, pending] = useActionState(deleteAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="agendaId" value={agendaId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover agenda">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function CreateAgendaEventForm({ agendaId }: { agendaId: string }) {
  const [state, formAction, pending] = useActionState(createAgendaEventAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Evento criado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="agendaId" value={agendaId} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${agendaId}-title`}>Título</label>
        <Input id={`${agendaId}-title`} name="title" placeholder="Reunião geral" required className="w-48" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${agendaId}-start`}>Data e hora</label>
        <Input id={`${agendaId}-start`} name="startAt" type="datetime-local" required className="w-56" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${agendaId}-description`}>Descrição (opcional)</label>
        <Textarea id={`${agendaId}-description`} name="description" rows={1} className="w-56" />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>Novo evento</Button>
    </form>
  );
}

function DeleteAgendaEventButton({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(deleteAgendaEventAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Evento removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover evento">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function formatEventDate(startAt: string | Date): string {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AgendaSection({
  agendas,
  eventsByAgenda,
}: {
  agendas: BroadcastAgendaRecord[];
  eventsByAgenda: Record<string, BroadcastAgendaEventRecord[]>;
}) {
  return (
    <div className="space-y-4">
      <CreateAgendaForm />
      {agendas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma agenda cadastrada ainda — crie uma (ex: &quot;Semanal&quot;) pra começar a adicionar eventos.
        </p>
      )}
      <div className="space-y-3">
        {agendas.map((agenda) => (
          <details key={agenda.id} className="rounded-panel border border-border bg-card p-3" open>
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full border border-border"
                  style={{ background: agenda.backgroundColor ?? DEFAULT_AGENDA_COLOR }}
                />
                {agenda.name} <span className="text-muted-foreground">({agenda.displaySeconds}s na tela)</span>
              </span>
              <DeleteAgendaButton agendaId={agenda.id} />
            </summary>
            <div className="mt-3 space-y-2">
              <EditAgendaForm agenda={agenda} />
              {(eventsByAgenda[agenda.id] ?? []).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3 rounded-panel border border-border bg-muted/40 p-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{event.title}</span>{" "}
                    <span className="text-muted-foreground">— {formatEventDate(event.startAt)}</span>
                    {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                  </div>
                  <DeleteAgendaEventButton eventId={event.id} />
                </div>
              ))}
              {(eventsByAgenda[agenda.id] ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum evento nesta agenda ainda.</p>
              )}
              <CreateAgendaEventForm agendaId={agenda.id} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
