"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronUp, Palette, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerField } from "@/components/media-picker-field";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — mesmo racional de
// outputs-section.tsx.
import type { BroadcastAgendaEventRecord, BroadcastAgendaRecord, BroadcastOutputRecord } from "@/plugins/broadcast/contracts/types";
import {
  createAgendaAction,
  createAgendaEventAction,
  deleteAgendaAction,
  deleteAgendaEventAction,
  reorderAgendasAction,
  setAgendaEditorsAction,
  setAgendaOutputsAction,
  updateAgendaAction,
  updateAgendaEventAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };
const DEFAULT_AGENDA_COLOR = "#0f0f0f";

// Não importa UserRef de @/contexts/auth (barrel arrasta next-auth/server pro bundle do browser,
// mesmo racional documentado em outros pontos deste arquivo) — mesmo padrão de AssignRoleForm
// (admin/rbac/_components/assign-role-form.tsx): tipo inline, campos mínimos.
type AssignableUser = { id: string; name: string | null; email: string };

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
      <MediaPickerField name="logoMediaAssetId" label="Logo da agenda (opcional, senão usa a logo da plataforma)" />
      <Button type="submit" disabled={pending}>Nova agenda</Button>
    </form>
  );
}

function EditAgendaForm({ agenda, logoMedia }: { agenda: BroadcastAgendaRecord; logoMedia: PickableMedia | null }) {
  const [state, formAction, pending] = useActionState(updateAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda atualizada." });

  return (
    <form
      // key muda quando o registro é salvo (updatedAt novo) — força remontar o form inteiro, senão
      // os <input defaultValue=...> não controlados (cor, nome, duração) continuam mostrando o
      // valor antigo depois do save: React só aplica defaultValue no mount, nunca em re-render de
      // uma instância já montada. Sem isso o operador salva, o dado grava certinho no banco, mas o
      // próprio formulário parece não ter mudado nada — achado real reportado pelo usuário.
      key={`${agenda.id}-${agenda.updatedAt.getTime()}`}
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-panel border border-border/60 bg-muted/30 p-2"
    >
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
      <MediaPickerField name="logoMediaAssetId" label="Logo da agenda" initialMedia={logoMedia} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>Salvar</Button>
    </form>
  );
}

// Mesmo padrão de MovePlaylistItemButton (playlists-section.tsx) — reenvia a lista inteira de
// agendas já reordenada.
function MoveAgendaButton({ agendaIds, direction }: { agendaIds: string[]; direction: "up" | "down" }) {
  const [state, formAction, pending] = useActionState(reorderAgendasAction, initialState);
  useActionToast({ pending, error: state.error });

  return (
    <form action={formAction}>
      <input type="hidden" name="agendaIds" value={JSON.stringify(agendaIds)} />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={pending}
        aria-label={direction === "up" ? "Mover agenda para cima" : "Mover agenda para baixo"}
      >
        {direction === "up" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </Button>
    </form>
  );
}

function DeleteAgendaButton({ agendaId }: { agendaId: string }) {
  const [state, formAction, pending] = useActionState(deleteAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda removida." });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Apagar esta agenda e todos os seus eventos?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="agendaId" value={agendaId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover agenda">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

// Vínculo agenda↔saída — checkboxes, todas as saídas resubmetidas via JSON (mesmo padrão de
// "reenviar o conjunto inteiro" das outras features deste arquivo). Nenhuma marcada = a agenda
// aparece em TODAS as saídas (modelo opt-out, ver comentário no schema broadcastOutputAgendas) —
// pedido real: "Agenda do Administrativo não precisa passar na Agenda Externa".
function AgendaOutputsForm({
  agendaId,
  outputs,
  selectedOutputIds,
}: {
  agendaId: string;
  outputs: BroadcastOutputRecord[];
  selectedOutputIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedOutputIds));
  const [state, formAction, pending] = useActionState(setAgendaOutputsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Saídas atualizadas." });

  if (outputs.length === 0) return null;

  function toggle(outputId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(outputId)) next.delete(outputId);
      else next.add(outputId);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-2 rounded-panel border border-border/60 bg-muted/20 p-2.5">
      <input type="hidden" name="agendaId" value={agendaId} />
      <input type="hidden" name="outputIds" value={JSON.stringify([...selected])} />
      <p className="text-xs font-medium text-foreground">Em quais telas esta agenda aparece</p>
      <p className="text-xs text-muted-foreground">Nenhuma marcada = aparece em todas as telas.</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {outputs.map((output) => (
          <label key={output.id} className="flex items-center gap-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={selected.has(output.id)}
              onChange={() => toggle(output.id)}
              className="size-4 rounded border-border"
            />
            {output.name}
          </label>
        ))}
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>Salvar telas</Button>
    </form>
  );
}

// "Responsável" pela agenda — pedido explícito: "adicionar um responsável (role editor pra cima)
// com acesso e permissão para alterar apenas a agenda atribuída". A atribuição sozinha não dá
// acesso: a pessoa também precisa ter o papel/permission "Editar agendas atribuídas" em
// /admin/rbac (broadcast.agenda.manage) — sem isso, estar atribuído aqui não tem efeito nenhum
// (ver shared/scoped-authorization/index.ts no backend).
function AgendaEditorsForm({
  agendaId,
  allUsers,
  selectedUserIds,
}: {
  agendaId: string;
  allUsers: AssignableUser[];
  selectedUserIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedUserIds));
  const [state, formAction, pending] = useActionState(setAgendaEditorsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Responsáveis atualizados." });

  function toggle(userId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-2 rounded-panel border border-border/60 bg-muted/20 p-2.5">
      <input type="hidden" name="agendaId" value={agendaId} />
      <input type="hidden" name="userIds" value={JSON.stringify([...selected])} />
      <p className="text-xs font-medium text-foreground">Responsável por esta agenda</p>
      <p className="text-xs text-muted-foreground">
        Pessoas marcadas podem editar só esta agenda — precisam também ter o papel &quot;Editar agendas atribuídas&quot; em
        Papéis e Permissões.
      </p>
      {allUsers.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
      ) : (
        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
          {allUsers.map((user) => (
            <label key={user.id} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={selected.has(user.id)}
                onChange={() => toggle(user.id)}
                className="size-4 shrink-0 rounded border-border"
              />
              <span className="truncate">{user.name ?? user.email} ({user.email})</span>
            </label>
          ))}
        </div>
      )}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>Salvar responsáveis</Button>
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
      <MediaPickerField name="coverMediaAssetId" label="Imagem de capa (opcional)" />
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

// <input type="datetime-local"> espera "YYYY-MM-DDTHH:mm" em horário local (sem timezone) — usa
// os getters locais do Date, não toISOString() (que converteria pra UTC e desalinharia a hora
// mostrada da hora realmente salva).
function toDatetimeLocalValue(startAt: string | Date): string {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EditAgendaEventForm({
  event,
  coverMedia,
  onDone,
}: {
  event: BroadcastAgendaEventRecord;
  coverMedia: PickableMedia | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateAgendaEventAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Evento atualizado.", onSuccess: onDone });

  return (
    <form
      // Mesmo racional do key em EditAgendaForm: força remontar o form (e seus inputs não
      // controlados) quando o registro muda, senão o formulário fica mostrando dado velho depois
      // de salvar mesmo com o banco já atualizado.
      key={`${event.id}-${event.updatedAt.getTime()}`}
      action={formAction}
      className="mt-2 flex flex-wrap items-end gap-2 rounded-panel border border-border/60 bg-muted/30 p-2"
    >
      <input type="hidden" name="eventId" value={event.id} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${event.id}-edit-title`}>Título</label>
        <Input id={`${event.id}-edit-title`} name="title" defaultValue={event.title} required className="w-48" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${event.id}-edit-start`}>Data e hora</label>
        <Input
          id={`${event.id}-edit-start`}
          name="startAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(event.startAt)}
          required
          className="w-56"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${event.id}-edit-description`}>Descrição (opcional)</label>
        <Textarea id={`${event.id}-edit-description`} name="description" defaultValue={event.description ?? ""} rows={1} className="w-56" />
      </div>
      <MediaPickerField name="coverMediaAssetId" label="Imagem de capa (opcional)" initialMedia={coverMedia} />
      <Button type="submit" size="sm" disabled={pending}>Salvar</Button>
      <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancelar</Button>
    </form>
  );
}

function AgendaEventRow({ event, coverMedia }: { event: BroadcastAgendaEventRecord; coverMedia: PickableMedia | null }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-panel border border-border bg-muted/40 p-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {event.coverMediaAssetId && (
            <span className="rounded-full bg-accent/14 px-2 py-0.5 text-[11px] text-muted-foreground">com capa</span>
          )}
          <div className="min-w-0">
            <span className="font-medium text-foreground">{event.title}</span>{" "}
            <span className="text-muted-foreground">— {formatEventDate(event.startAt)}</span>
            {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setEditing((previous) => !previous)}
            aria-label={editing ? "Fechar edição" : "Editar evento"}
          >
            <Pencil className="size-4" />
          </Button>
          <DeleteAgendaEventButton eventId={event.id} />
        </div>
      </div>
      {editing && <EditAgendaEventForm event={event} coverMedia={coverMedia} onDone={() => setEditing(false)} />}
    </div>
  );
}

export function AgendaSection({
  agendas,
  eventsByAgenda,
  agendaLogoMediaById,
  eventCoverMediaById,
  outputs,
  agendaOutputIdsByAgendaId,
  canManageAll = true,
  allUsers = [],
  agendaEditorUserIdsByAgendaId = {},
}: {
  agendas: BroadcastAgendaRecord[];
  eventsByAgenda: Record<string, BroadcastAgendaEventRecord[]>;
  agendaLogoMediaById: Record<string, PickableMedia | null>;
  eventCoverMediaById: Record<string, PickableMedia | null>;
  outputs: BroadcastOutputRecord[];
  agendaOutputIdsByAgendaId: Record<string, string[]>;
  // false pra um ator sem broadcast.manage (só broadcast.agenda.manage — "responsável" por
  // agendas específicas, ver page.tsx) — esconde criar/apagar/reordenar agenda, o vínculo
  // agenda↔saída e a atribuição de responsáveis, que continuam ação de quem administra tudo.
  canManageAll?: boolean;
  allUsers?: AssignableUser[];
  agendaEditorUserIdsByAgendaId?: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      {canManageAll && <CreateAgendaForm />}
      {agendas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {canManageAll
            ? 'Nenhuma agenda cadastrada ainda — crie uma (ex: "Semanal") pra começar a adicionar eventos.'
            : "Nenhuma agenda foi atribuída a você ainda."}
        </p>
      )}
      <div className="space-y-3">
        {agendas.map((agenda, index) => {
          const upOrder =
            index > 0
              ? [...agendas.slice(0, index - 1), agendas[index], agendas[index - 1], ...agendas.slice(index + 1)].map((a) => a.id)
              : null;
          const downOrder =
            index < agendas.length - 1
              ? [...agendas.slice(0, index), agendas[index + 1], agendas[index], ...agendas.slice(index + 2)].map((a) => a.id)
              : null;

          return (
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
                {canManageAll && (
                  // stopPropagation — sem isso, clicar em mover/apagar também alterna o <details>
                  // (o clique borbulha pro <summary>, disclosure trigger nativo).
                  <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                    {upOrder && <MoveAgendaButton agendaIds={upOrder} direction="up" />}
                    {downOrder && <MoveAgendaButton agendaIds={downOrder} direction="down" />}
                    <DeleteAgendaButton agendaId={agenda.id} />
                  </div>
                )}
              </summary>
              <div className="mt-3 space-y-2">
                <EditAgendaForm agenda={agenda} logoMedia={agendaLogoMediaById[agenda.id] ?? null} />
                {canManageAll && (
                  <>
                    <AgendaOutputsForm agendaId={agenda.id} outputs={outputs} selectedOutputIds={agendaOutputIdsByAgendaId[agenda.id] ?? []} />
                    <AgendaEditorsForm
                      agendaId={agenda.id}
                      allUsers={allUsers}
                      selectedUserIds={agendaEditorUserIdsByAgendaId[agenda.id] ?? []}
                    />
                  </>
                )}
                {(eventsByAgenda[agenda.id] ?? []).map((event) => (
                  <AgendaEventRow key={event.id} event={event} coverMedia={eventCoverMediaById[event.id] ?? null} />
                ))}
                {(eventsByAgenda[agenda.id] ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum evento nesta agenda ainda.</p>
                )}
                <CreateAgendaEventForm agendaId={agenda.id} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
