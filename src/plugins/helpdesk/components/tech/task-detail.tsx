"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TicketDetail } from "@/plugins/helpdesk";
import { MAX_TICKET_ATTACHMENTS_PER_SCOPE, TICKET_PRIORITIES, TICKET_STATUSES } from "@/plugins/helpdesk/contracts/types";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS_TEAM } from "@/plugins/helpdesk/shared/ticket-status-display";
import { SLA_STATE_LABEL, SLA_STATE_TEXT_CLASS, TICKET_PRIORITY_LABELS, isSlaHighlighted } from "@/plugins/helpdesk/shared/sla-display";
import { TicketTimeline } from "../portal/ticket-timeline";
import {
  techAddCommentAction,
  techAssignToMeAction,
  techChangePriorityAction,
  techChangeStatusAction,
  type TechActionState,
} from "../../routes/technician-app/actions";

const initialState: TechActionState = { error: null };

// Detalhe do chamado no app do técnico (§4) — timeline + ações (assumir, mudar status, comentar,
// anexar), reusando as mesmas features/ do admin. Mobile-first: pilha de blocos, largura total.
export function TaskDetail({
  detail,
  tab,
  currentUserId,
  authorNames,
}: {
  detail: TicketDetail;
  tab: string;
  currentUserId: string;
  authorNames: Record<string, string>;
}) {
  const router = useRouter();
  const { ticket } = detail;

  const [assignState, assignAction, assignPending] = useActionState(techAssignToMeAction, initialState);
  const [statusState, statusAction, statusPending] = useActionState(techChangeStatusAction, initialState);
  const [priorityState, priorityAction, priorityPending] = useActionState(techChangePriorityAction, initialState);
  const [commentState, commentAction, commentPending] = useActionState(techAddCommentAction, initialState);

  useActionToast({ pending: assignPending, error: assignState.error, successMessage: "Chamado assumido.", onSuccess: () => router.refresh() });
  useActionToast({ pending: statusPending, error: statusState.error, successMessage: "Status atualizado.", onSuccess: () => router.refresh() });
  useActionToast({ pending: priorityPending, error: priorityState.error, successMessage: "Prioridade atualizada.", onSuccess: () => router.refresh() });
  useActionToast({ pending: commentPending, error: commentState.error, successMessage: "Comentário enviado.", onSuccess: () => router.refresh() });

  const isMine = ticket.assigneeUserId === currentUserId;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => router.push(`?tab=${tab}`)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {detail.reference}
          </Badge>
          <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>{TICKET_STATUS_LABELS_TEAM[ticket.status]}</Badge>
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{ticket.title}</h1>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{detail.queue.name}</span>
          {detail.category ? <span>· {detail.category.label}</span> : null}
          {ticket.location ? (
            <span className="inline-flex items-center gap-1">
              · <MapPin className="size-3.5" />
              {ticket.location}
            </span>
          ) : null}
        </p>
      </div>

      <p className="rounded-xl border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap text-foreground">
        {ticket.description}
      </p>

      {(isSlaHighlighted(detail.slaState) || ticket.slaDueAt) && (
        <p
          className={`flex flex-wrap items-center gap-1.5 text-xs ${
            isSlaHighlighted(detail.slaState) ? `font-medium ${SLA_STATE_TEXT_CLASS[detail.slaState]}` : "text-muted-foreground"
          }`}
        >
          {isSlaHighlighted(detail.slaState) && <AlertTriangle className="size-3.5" />}
          {isSlaHighlighted(detail.slaState) ? SLA_STATE_LABEL[detail.slaState] : "SLA"}
          {ticket.slaDueAt
            ? ` · prazo ${new Date(ticket.slaDueAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
            : ""}
        </p>
      )}

      <form action={priorityAction} className="space-y-2 rounded-xl border border-border p-3">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <p className="text-sm font-semibold text-foreground">Prioridade</p>
        <Select key={`${ticket.id}:${ticket.priority}`} name="priority" defaultValue={ticket.priority}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {TICKET_PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary" disabled={priorityPending} className="w-full sm:w-auto">
          Salvar prioridade
        </Button>
      </form>

      {!isMine && (
        <form action={assignAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <Button type="submit" variant="secondary" disabled={assignPending} className="w-full sm:w-auto">
            Assumir este chamado
          </Button>
        </form>
      )}

      <form action={statusAction} className="space-y-2 rounded-xl border border-border p-3">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <p className="text-sm font-semibold text-foreground">Mudar status</p>
        <Select name="to" defaultValue="">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {TICKET_STATUSES.filter((status) => status !== ticket.status).map((status) => (
              <SelectItem key={status} value={status}>
                {TICKET_STATUS_LABELS_TEAM[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea name="note" rows={2} placeholder="Comentário público sobre a mudança (opcional)" />
        <Button type="submit" variant="secondary" disabled={statusPending} className="w-full sm:w-auto">
          Aplicar
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Andamento</h2>
        <TicketTimeline entries={detail.timeline} authorNames={authorNames} currentUserId={currentUserId} />
      </section>

      <form action={commentAction} className="space-y-2 rounded-xl border border-border p-3">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <p className="text-sm font-semibold text-foreground">Comentar</p>
        <Textarea name="body" required rows={3} placeholder="Escrever comentário..." />
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Fotos (até {MAX_TICKET_ATTACHMENTS_PER_SCOPE}, opcional)
          <input
            type="file"
            name="photos"
            accept="image/*,application/pdf"
            multiple
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Select name="visibility" defaultValue="public">
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Resposta pública (o solicitante vê)</SelectItem>
              <SelectItem value="internal">Nota interna (só a equipe)</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={commentPending} className="w-full sm:w-auto">
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
