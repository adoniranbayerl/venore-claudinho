"use client";

import { useActionState, useState, type ReactNode } from "react";
import { CalendarPlus, ChevronDown, ChevronUp, Pencil, Trash2, Tv, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerField } from "@/components/media-picker-field";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — mesmo racional de
// outputs-section.tsx.
import type { BroadcastAgendaEventRecord, BroadcastAgendaRecord, BroadcastOutputRecord } from "@/plugins/broadcast/contracts/types";
// Import direto do módulo compartilhado (não do barrel @/plugins/broadcast) — mesma regra dos
// tipos acima: client component nunca pode arrastar o barrel de server (Drizzle/pg) pro bundle.
import { resolveEventOccurrenceDate } from "@/plugins/broadcast/shared/weekly-recurrence";
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
} from "./actions";

const initialState: BroadcastActionState = { error: null };
const DEFAULT_AGENDA_COLOR = "#0f0f0f";

// Não importa UserRef de @/contexts/auth (barrel arrasta next-auth/server pro bundle do browser,
// mesmo racional documentado em outros pontos deste arquivo) — mesmo padrão de AssignRoleForm
// (admin/rbac/_components/assign-role-form.tsx): tipo inline, campos mínimos.
type AssignableUser = { id: string; name: string | null; email: string };

// Campos empilhados verticalmente (label em cima, campo largura cheia) em todos os formulários
// deste arquivo — mesmo racional já aplicado em playlists-section.tsx: um formulário com vários
// campos lado a lado (flex-wrap) quebra em containers estreitos e fica difícil de escanear;
// empilhado nunca depende da largura disponível pra ficar legível. Feedback direto: "a UX da
// admin/broadcast Agenda precisa ser alterada, está muito complexa e pouco intuitiva".
function CreateAgendaForm() {
  const [state, formAction, pending] = useActionState(createAgendaAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Agenda criada." });

  return (
    <form action={formAction} className="space-y-3 rounded-panel border border-border bg-card p-3">
      <p className="text-sm font-medium text-foreground">Nova agenda</p>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="agenda-name">Nome</label>
        <Input id="agenda-name" name="name" placeholder="Semanal, Mensal, Faculdade..." required className="w-full sm:max-w-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="agenda-duration">Segundos na tela antes de trocar</label>
        <Input id="agenda-duration" name="displaySeconds" type="number" placeholder="20" className="w-32" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="agenda-color">Cor de fundo na TV</label>
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
      className="space-y-3"
    >
      <input type="hidden" name="agendaId" value={agenda.id} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${agenda.id}-edit-name`}>Nome</label>
        <Input id={`${agenda.id}-edit-name`} name="name" defaultValue={agenda.name} required className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${agenda.id}-edit-duration`}>Segundos na tela</label>
        <Input
          id={`${agenda.id}-edit-duration`}
          name="displaySeconds"
          type="number"
          defaultValue={agenda.displaySeconds}
          className="w-32"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${agenda.id}-edit-color`}>Cor de fundo</label>
        <input
          id={`${agenda.id}-edit-color`}
          name="backgroundColor"
          type="color"
          defaultValue={agenda.backgroundColor ?? DEFAULT_AGENDA_COLOR}
          className="h-9 w-16 cursor-pointer rounded-md border border-border"
        />
      </div>
      <MediaPickerField name="logoMediaAssetId" label="Logo da agenda" initialMedia={logoMedia} />
      <Button type="submit" size="sm" disabled={pending}>Salvar</Button>
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
      <Button type="submit" variant="destructive" size="icon" disabled={pending} aria-label="Remover agenda">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

// Vínculo agenda↔saída — checkboxes, todas as saídas resubmetidas via JSON (mesmo padrão de
// "reenviar o conjunto inteiro" das outras features deste arquivo). Nenhuma marcada = a agenda
// não aparece em NENHUMA saída (modelo opt-in, ver comentário no schema broadcastOutputAgendas) —
// pedido real: "só deve aparecer QUANDO estiver vinculada a uma tela".
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
  useActionToast({ pending, error: state.error, successMessage: "Telas atualizadas." });

  if (outputs.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhuma tela cadastrada ainda.</p>;
  }

  function toggle(outputId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(outputId)) next.delete(outputId);
      else next.add(outputId);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="agendaId" value={agendaId} />
      <input type="hidden" name="outputIds" value={JSON.stringify([...selected])} />
      <p className="text-xs text-muted-foreground">Nenhuma marcada = não aparece em nenhuma tela.</p>
      <div className="flex flex-col gap-1.5">
        {outputs.map((output) => (
          <label key={output.id} className="flex items-center gap-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={selected.has(output.id)}
              onChange={() => toggle(output.id)}
              className="size-4 shrink-0 rounded border-border"
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
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="agendaId" value={agendaId} />
      <input type="hidden" name="userIds" value={JSON.stringify([...selected])} />
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

type AgendaPanel = "edit" | "outputs" | "editors";

// Ícone renderizado (não componente) — react-hooks/static-components não aceita <Icon /> com uma
// referência de componente calculada em runtime (mesmo padrão de renderAddOptionIcon em
// playlists-section.tsx).
function renderAgendaPanelIcon(panel: AgendaPanel): ReactNode {
  const className = "size-3.5";
  switch (panel) {
    case "edit":
      return <Pencil className={className} aria-hidden="true" />;
    case "outputs":
      return <Tv className={className} aria-hidden="true" />;
    case "editors":
      return <Users className={className} aria-hidden="true" />;
  }
}

const AGENDA_PANEL_LABEL: Record<AgendaPanel, string> = {
  edit: "Editar",
  outputs: "Onde aparece",
  editors: "Responsáveis",
};

// Chips (Editar / Onde aparece / Responsáveis) + um único painel visível por vez, em vez dos três
// formulários sempre abertos empilhados — mesmo racional de PlaylistAddSection
// (playlists-section.tsx): a agenda em si (nome/cor/duração/logo) já aparece resumida no
// cabeçalho, então editá-la é uma ação ocasional, não algo que precisa ocupar espaço o tempo
// todo. Eventos (o conteúdo do dia a dia) ficam fora daqui, sempre visíveis.
function AgendaSettingsPanels({
  agenda,
  logoMedia,
  outputs,
  selectedOutputIds,
  allUsers,
  selectedUserIds,
}: {
  agenda: BroadcastAgendaRecord;
  logoMedia: PickableMedia | null;
  outputs: BroadcastOutputRecord[];
  selectedOutputIds: string[];
  allUsers: AssignableUser[];
  selectedUserIds: string[];
}) {
  const [active, setActive] = useState<AgendaPanel | null>(null);
  const panels: AgendaPanel[] = ["edit", "outputs", "editors"];

  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <div className="flex flex-wrap gap-2">
        {panels.map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setActive((current) => (current === panel ? null : panel))}
            className={
              active === panel
                ? "flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ui-motion-base"
                : "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground ui-motion-base hover:border-ring"
            }
          >
            {renderAgendaPanelIcon(panel)}
            {AGENDA_PANEL_LABEL[panel]}
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-panel border border-border/60 bg-muted/20 p-3">
          {active === "edit" && <EditAgendaForm agenda={agenda} logoMedia={logoMedia} />}
          {active === "outputs" && <AgendaOutputsForm agendaId={agenda.id} outputs={outputs} selectedOutputIds={selectedOutputIds} />}
          {active === "editors" && <AgendaEditorsForm agendaId={agenda.id} allUsers={allUsers} selectedUserIds={selectedUserIds} />}
        </div>
      )}
    </div>
  );
}

const WEEKDAY_LABELS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Qualquer data com o dia da semana certo serve de âncora (weekly-recurrence.ts: só o dia da
// semana e o horário do anchor importam pra evento recorrente, nunca a data em si) — não faz
// sentido pedir uma data específica quando o operador já disse "toda quarta".
function buildWeekdayAnchor(weekday: number, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const anchor = new Date();
  anchor.setHours(hours || 0, minutes || 0, 0, 0);
  anchor.setDate(anchor.getDate() + (weekday - anchor.getDay()));
  return anchor;
}

// Campos de data/hora do evento — separados (não mais um único <input type="datetime-local">) e
// com um modo dedicado pra recorrência: marcando "repete toda semana", o campo de data específica
// vira um seletor de dia da semana (informar o dia da semana já basta, não precisa também de uma
// data — mesmo racional de buildWeekdayAnchor acima). O <input type="hidden" name="startAt">
// computado mantém o server action (createAgendaEventAction/updateAgendaEventAction) exatamente
// como já era, sem tocar backend.
function AgendaEventDateTimeFields({
  idPrefix,
  defaultDate,
  defaultRecurring,
  defaultEndTime,
}: {
  idPrefix: string;
  defaultDate: Date;
  defaultRecurring: boolean;
  defaultEndTime?: string | null;
}) {
  const [recurring, setRecurring] = useState(defaultRecurring);
  const [date, setDate] = useState(() => toDateInputValue(defaultDate));
  const [time, setTime] = useState(() => toTimeInputValue(defaultDate));
  const [weekday, setWeekday] = useState(defaultDate.getDay());
  // "HH:mm:ss" vindo do banco (coluna `time`) vira "HH:mm" pro <input type="time"> — mesmo
  // formato que toTimeInputValue já produz.
  const [endTime, setEndTime] = useState(defaultEndTime?.slice(0, 5) ?? "");

  const startAt = recurring ? buildWeekdayAnchor(weekday, time) : new Date(`${date}T${time || "00:00"}`);
  const startAtValue = Number.isNaN(startAt.getTime()) ? "" : toDatetimeLocalValue(startAt);

  const endTimeField = (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={`${idPrefix}-end-time`}>
        Término (opcional)
      </label>
      <Input
        id={`${idPrefix}-end-time`}
        type="time"
        value={endTime}
        onChange={(event) => setEndTime(event.target.value)}
        // Impede escolher um fim antes do início — nativo do browser, sem precisar de validação
        // própria (mesmo padrão de "required" já usado nos outros campos deste form).
        min={time || undefined}
        className="w-28"
      />
    </div>
  );

  function handleRecurringChange(checked: boolean) {
    if (checked) {
      // Ligando recorrência: já parte do dia da semana da data escolhida até agora, em vez de
      // resetar pro dia atual.
      const [year, month, day] = date.split("-").map(Number);
      setWeekday(new Date(year, month - 1, day).getDay());
    } else {
      // Desligando: a data volta a ser específica — usa a data efetiva da âncora recorrente (dia
      // da semana + horário já escolhidos), não a data original do form.
      setDate(toDateInputValue(startAt));
    }
    setRecurring(checked);
  }

  return (
    // Bloco próprio ("Quando") separado do resto do card por um divisor, mesmo nível hierárquico
    // de "Eventos" em AgendaCard (rótulo uppercase pequeno) — data/hora/recorrência formam um
    // único grupo de decisão, não três campos soltos.
    <div className="space-y-3 border-t border-border/60 pt-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Quando</p>
      <input type="hidden" name="startAt" value={startAtValue} />
      <input type="hidden" name="recurring" value={recurring ? "on" : ""} />
      <input type="hidden" name="endTime" value={endTime} />

      <div className="flex items-center gap-2.5">
        <Switch id={`${idPrefix}-recurring`} checked={recurring} onCheckedChange={handleRecurringChange} />
        <label className="text-sm text-foreground" htmlFor={`${idPrefix}-recurring`}>
          Repete toda semana
        </label>
      </div>

      {recurring ? (
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${idPrefix}-weekday`}>
              Dia da semana
            </label>
            <Select value={String(weekday)} onValueChange={(value) => setWeekday(Number(value))}>
              <SelectTrigger id={`${idPrefix}-weekday`} className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_LABELS.map((label, index) => (
                  <SelectItem key={label} value={String(index)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${idPrefix}-time`}>
              Horário
            </label>
            <Input id={`${idPrefix}-time`} type="time" value={time} onChange={(event) => setTime(event.target.value)} required className="w-28" />
          </div>
          {endTimeField}
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${idPrefix}-date`}>
              Data
            </label>
            <Input id={`${idPrefix}-date`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="w-40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${idPrefix}-time`}>
              Horário
            </label>
            <Input id={`${idPrefix}-time`} type="time" value={time} onChange={(event) => setTime(event.target.value)} required className="w-28" />
          </div>
          {endTimeField}
        </div>
      )}

      {recurring && startAtValue && (
        <p className="text-xs text-muted-foreground">
          Próxima ocorrência: {formatEventDate(resolveEventOccurrenceDate({ startAt, recurring: true }))}
          {endTime && ` – ${endTime}`}
        </p>
      )}
    </div>
  );
}

function CreateAgendaEventForm({ agendaId, onAdded }: { agendaId: string; onAdded: () => void }) {
  const [state, formAction, pending] = useActionState(createAgendaEventAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Evento criado.", onSuccess: onAdded });
  const formId = `${agendaId}-create-event`;

  return (
    <Card size="sm" className="bg-muted/20">
      <CardHeader>
        <CardTitle>Novo evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form id={formId} action={formAction} className="space-y-4">
          <input type="hidden" name="agendaId" value={agendaId} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${agendaId}-title`}>Título</label>
            <Input id={`${agendaId}-title`} name="title" placeholder="Reunião geral" required className="w-full" />
          </div>
          <AgendaEventDateTimeFields idPrefix={`${agendaId}-create`} defaultDate={new Date()} defaultRecurring={false} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${agendaId}-description`}>Descrição (opcional)</label>
            <Textarea id={`${agendaId}-description`} name="description" rows={2} className="w-full" />
          </div>
          <MediaPickerField name="coverMediaAssetId" label="Imagem de capa (opcional)" />
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form={formId} disabled={pending} className="w-full sm:w-auto">Criar evento</Button>
      </CardFooter>
    </Card>
  );
}

function DeleteAgendaEventButton({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(deleteAgendaEventAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Evento removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <Button type="submit" variant="destructive" size="icon" disabled={pending} aria-label="Remover evento">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function formatEventDate(startAt: string | Date): string {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  // Dia da semana explícito (não só a data numérica) — pedido explícito: "existem eventos que são
  // recorrentes toda semana, vale colocar o dia da semana na view".
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const rest = date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return `${weekday}, ${rest}`;
}

// "" quando não tem término definido — "HH:mm:ss" (coluna `time`) vira só "HH:mm" na exibição.
function formatEndTimeSuffix(endTime: string | null): string {
  return endTime ? ` – ${endTime.slice(0, 5)}` : "";
}

// "Toda quarta-feira" etc — mostrado ao lado da data da próxima ocorrência (formatEventDate já
// resolve pra data efetiva, ver AgendaEventRow), pra deixar claro que aquela data é só a próxima,
// não a única. Pedido real: "quero criar um evento que acontece toda semana [...] não quero ter
// que ficar trocando a data toda semana".
function formatRecurringBadge(startAt: string | Date): string {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `Toda ${weekday}`;
}

// <input type="datetime-local"> espera "YYYY-MM-DDTHH:mm" em horário local (sem timezone) — usa
// os getters locais do Date, não toISOString() (que converteria pra UTC e desalinharia a hora
// mostrada da hora realmente salva).
function toDatetimeLocalValue(startAt: string | Date): string {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  return `${toDateInputValue(date)}T${toTimeInputValue(date)}`;
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
  const formId = `${event.id}-edit-event`;

  return (
    <Card
      // Mesmo racional do key em EditAgendaForm: força remontar o card inteiro (e seus inputs não
      // controlados) quando o registro muda, senão o formulário fica mostrando dado velho depois
      // de salvar mesmo com o banco já atualizado.
      key={`${event.id}-${event.updatedAt.getTime()}`}
      size="sm"
      className="mt-2 bg-muted/30"
    >
      <CardHeader>
        <CardTitle>Editar evento</CardTitle>
      </CardHeader>
      <CardContent>
        <form id={formId} action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${event.id}-edit-title`}>Título</label>
            <Input id={`${event.id}-edit-title`} name="title" defaultValue={event.title} required className="w-full" />
          </div>
          <AgendaEventDateTimeFields
            idPrefix={`${event.id}-edit`}
            // Pra evento recorrente, parte da PRÓXIMA ocorrência (não a âncora crua, que pode ser
            // de meses atrás) — mais intuitivo pro admin, e salvar sem trocar o dia da semana
            // mantém o mesmo padrão de recorrência, só "avança" a âncora.
            defaultDate={resolveEventOccurrenceDate(event)}
            defaultRecurring={event.recurring}
            defaultEndTime={event.endTime}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${event.id}-edit-description`}>Descrição (opcional)</label>
            <Textarea id={`${event.id}-edit-description`} name="description" defaultValue={event.description ?? ""} rows={2} className="w-full" />
          </div>
          <MediaPickerField name="coverMediaAssetId" label="Imagem de capa (opcional)" initialMedia={coverMedia} />
        </form>
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="submit" form={formId} size="sm" disabled={pending}>Salvar</Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancelar</Button>
      </CardFooter>
    </Card>
  );
}

function AgendaEventRow({ event, coverMedia }: { event: BroadcastAgendaEventRecord; coverMedia: PickableMedia | null }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-panel border border-border bg-muted/40 p-2.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {event.recurring && (
            <span className="shrink-0 rounded-full bg-accent/14 px-2 py-0.5 text-[11px] text-muted-foreground">
              {formatRecurringBadge(event.startAt)}
            </span>
          )}
          {event.coverMediaAssetId && (
            <span className="shrink-0 rounded-full bg-accent/14 px-2 py-0.5 text-[11px] text-muted-foreground">com capa</span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{event.title}</p>
            {/* Data mostrada é sempre a PRÓXIMA ocorrência (resolveEventOccurrenceDate é no-op pra
                evento não-recorrente) — pedido real: "mostre a data da quarta próxima". */}
            <p className="truncate text-xs text-muted-foreground">
              {formatEventDate(resolveEventOccurrenceDate(event))}
              {formatEndTimeSuffix(event.endTime)}
            </p>
            {event.description && <p className="truncate text-xs text-muted-foreground">{event.description}</p>}
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

// Uma agenda inteira: cabeçalho resumido (cor, nome, duração, nº de eventos) + configurações
// atrás de chips (AgendaSettingsPanels) + lista de eventos, sempre visível, com "Novo evento"
// também atrás de um botão (evita um quarto formulário sempre aberto).
function AgendaCard({
  agenda,
  events,
  logoMedia,
  eventCoverMediaById,
  outputs,
  selectedOutputIds,
  canManageAll,
  allUsers,
  selectedUserIds,
  upOrder,
  downOrder,
}: {
  agenda: BroadcastAgendaRecord;
  events: BroadcastAgendaEventRecord[];
  logoMedia: PickableMedia | null;
  eventCoverMediaById: Record<string, PickableMedia | null>;
  outputs: BroadcastOutputRecord[];
  selectedOutputIds: string[];
  canManageAll: boolean;
  allUsers: AssignableUser[];
  selectedUserIds: string[];
  upOrder: string[] | null;
  downOrder: string[] | null;
}) {
  const [addingEvent, setAddingEvent] = useState(false);

  return (
    <details className="rounded-panel border border-border bg-card p-3" open>
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-full border border-border"
            style={{ background: agenda.backgroundColor ?? DEFAULT_AGENDA_COLOR }}
          />
          <span className="truncate">{agenda.name}</span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{agenda.displaySeconds}s na tela</span>
        </span>
        {canManageAll && (
          // stopPropagation — sem isso, clicar em mover/apagar também alterna o <details>
          // (o clique borbulha pro <summary>, disclosure trigger nativo).
          <div className="flex shrink-0 items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
            {upOrder && <MoveAgendaButton agendaIds={upOrder} direction="up" />}
            {downOrder && <MoveAgendaButton agendaIds={downOrder} direction="down" />}
            <DeleteAgendaButton agendaId={agenda.id} />
          </div>
        )}
      </summary>
      <div className="mt-3 space-y-3">
        {canManageAll ? (
          <AgendaSettingsPanels
            agenda={agenda}
            logoMedia={logoMedia}
            outputs={outputs}
            selectedOutputIds={selectedOutputIds}
            allUsers={allUsers}
            selectedUserIds={selectedUserIds}
          />
        ) : (
          // Editor de agenda restrito (sem broadcast.manage) só edita a agenda em si — vínculo
          // agenda↔saída e atribuição de responsáveis continuam ação de quem administra tudo.
          <div className="border-t border-border/60 pt-3">
            <EditAgendaForm agenda={agenda} logoMedia={logoMedia} />
          </div>
        )}

        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Eventos</p>
            <button
              type="button"
              onClick={() => setAddingEvent((previous) => !previous)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground ui-motion-base hover:border-ring"
            >
              <CalendarPlus className="size-3.5" aria-hidden="true" />
              Novo evento
            </button>
          </div>

          {addingEvent && <CreateAgendaEventForm agendaId={agenda.id} onAdded={() => setAddingEvent(false)} />}

          <div className="space-y-2">
            {events.map((event) => (
              <AgendaEventRow key={event.id} event={event} coverMedia={eventCoverMediaById[event.id] ?? null} />
            ))}
            {events.length === 0 && <p className="text-xs text-muted-foreground">Nenhum evento nesta agenda ainda.</p>}
          </div>
        </div>
      </div>
    </details>
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
            <AgendaCard
              key={agenda.id}
              agenda={agenda}
              events={eventsByAgenda[agenda.id] ?? []}
              logoMedia={agendaLogoMediaById[agenda.id] ?? null}
              eventCoverMediaById={eventCoverMediaById}
              outputs={outputs}
              selectedOutputIds={agendaOutputIdsByAgendaId[agenda.id] ?? []}
              canManageAll={canManageAll}
              allUsers={allUsers}
              selectedUserIds={agendaEditorUserIdsByAgendaId[agenda.id] ?? []}
              upOrder={upOrder}
              downOrder={downOrder}
            />
          );
        })}
      </div>
    </div>
  );
}
