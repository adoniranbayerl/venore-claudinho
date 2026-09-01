"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TicketDetail } from "@/plugins/helpdesk";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/plugins/helpdesk/contracts/types";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS_TEAM } from "@/plugins/helpdesk/shared/ticket-status-display";
import { SLA_STATE_LABEL, SLA_STATE_TEXT_CLASS, TICKET_PRIORITY_LABELS, isSlaHighlighted } from "@/plugins/helpdesk/shared/sla-display";
import { TicketTimeline } from "../portal/ticket-timeline";
import {
  addTicketNoteAction,
  assignTicketAction,
  changeTicketPriorityAction,
  changeTicketStatusAction,
  type HelpdeskTicketActionState,
} from "../../routes/admin/ticket-actions";

const initialState: HelpdeskTicketActionState = { error: null };

type UserOption = { id: string; name: string };

export function TicketDrawer({
  open,
  tab,
  detail,
  assignableUsers,
  authorNames,
  currentUserId,
}: {
  open: boolean;
  tab: string;
  detail: TicketDetail | null;
  assignableUsers: UserOption[];
  authorNames: Record<string, string>;
  currentUserId: string | null;
}) {
  const router = useRouter();

  const [assignState, assignAction, assignPending] = useActionState(assignTicketAction, initialState);
  const [statusState, statusAction, statusPending] = useActionState(changeTicketStatusAction, initialState);
  const [priorityState, priorityAction, priorityPending] = useActionState(changeTicketPriorityAction, initialState);
  const [noteState, noteAction, notePending] = useActionState(addTicketNoteAction, initialState);

  useActionToast({ pending: assignPending, error: assignState.error, successMessage: "Responsável atualizado.", onSuccess: () => router.refresh() });
  useActionToast({ pending: statusPending, error: statusState.error, successMessage: "Status atualizado.", onSuccess: () => router.refresh() });
  useActionToast({ pending: priorityPending, error: priorityState.error, successMessage: "Prioridade atualizada.", onSuccess: () => router.refresh() });
  useActionToast({ pending: notePending, error: noteState.error, successMessage: "Comentário adicionado.", onSuccess: () => router.refresh() });

  function close() {
    router.push(`?tab=${tab}`, { scroll: false });
  }

  if (!detail) return null;
  const { ticket } = detail;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {detail.reference}
            </Badge>
            <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>{TICKET_STATUS_LABELS_TEAM[ticket.status]}</Badge>
          </div>
          <DialogTitle className="text-left">{ticket.title}</DialogTitle>
          <DialogDescription className="text-left">
            {detail.queue.name}
            {detail.category ? ` · ${detail.category.label}` : ""}
            {ticket.location ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {ticket.location}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap text-foreground">
            {ticket.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Prioridade: <span className="text-foreground">{TICKET_PRIORITY_LABELS[ticket.priority]}</span>
            </span>
            {ticket.slaDueAt && (
              <span className={isSlaHighlighted(detail.slaState) ? `inline-flex items-center gap-1 font-medium ${SLA_STATE_TEXT_CLASS[detail.slaState]}` : ""}>
                {isSlaHighlighted(detail.slaState) && <AlertTriangle className="size-3" />}
                {isSlaHighlighted(detail.slaState) ? SLA_STATE_LABEL[detail.slaState] : "SLA"}: prazo{" "}
                {new Date(ticket.slaDueAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            )}
          </div>

          <form action={priorityAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Prioridade
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
            </label>
            <Button type="submit" variant="secondary" disabled={priorityPending}>
              Repriorizar
            </Button>
          </form>

          <form action={assignAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Responsável
              <Select name="assigneeUserId" defaultValue={ticket.assigneeUserId ?? "__none__"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem responsável</SelectItem>
                  {assignableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Button type="submit" variant="secondary" disabled={assignPending}>
              Atribuir
            </Button>
          </form>

          <form action={statusAction} className="space-y-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Mudar status para
                <Select name="to" defaultValue="">
                  <SelectTrigger className="w-52">
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
              </label>
              <Button type="submit" variant="secondary" disabled={statusPending}>
                Aplicar
              </Button>
            </div>
            <Textarea name="note" rows={2} placeholder="Comentário público sobre a mudança (opcional)" />
          </form>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
            <TicketTimeline entries={detail.timeline} authorNames={authorNames} currentUserId={currentUserId} />
          </section>

          <form action={noteAction} className="space-y-2 rounded-lg border border-border p-3">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <Textarea name="body" required rows={3} placeholder="Escrever comentário..." />
            <div className="flex flex-wrap items-center gap-2">
              <Select name="visibility" defaultValue="internal">
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Nota interna (só a equipe)</SelectItem>
                  <SelectItem value="public">Resposta pública (o solicitante vê)</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={notePending}>
                Comentar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
