import { AlertTriangle, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BoardFeedTicket, TicketPriority } from "@/plugins/helpdesk/contracts/types";
import {
  SLA_STATE_SHORT_LABEL,
  SLA_STATE_TEXT_CLASS,
  TICKET_PRIORITY_LABELS,
  isSlaHighlighted,
} from "@/plugins/helpdesk/shared/sla-display";

// Card do painel de TV (§2.6). Só token shadcn de cor; realce de SLA é o único uso de
// `text-warning`/`text-destructive` (via sla-display). Tamanhos generosos — legível a ~3 m.
const PRIORITY_VARIANT: Record<TicketPriority, "default" | "secondary" | "outline" | "destructive"> = {
  urgent: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

function formatAge(minutes: number): string {
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function TicketCard({
  ticket,
  showAssignee,
  showQueue,
}: {
  ticket: BoardFeedTicket;
  showAssignee: boolean;
  showQueue: boolean;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold leading-snug text-foreground sm:text-xl">{ticket.title}</p>
        {ticket.priority !== "normal" && (
          <Badge variant={PRIORITY_VARIANT[ticket.priority]} className="shrink-0 text-sm">
            {TICKET_PRIORITY_LABELS[ticket.priority]}
          </Badge>
        )}
      </div>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:text-base">
        <span className="font-mono">{ticket.reference}</span>
        {showQueue && <span>· {ticket.queueName}</span>}
        {ticket.categoryLabel && <span>· {ticket.categoryLabel}</span>}
      </p>

      {ticket.location && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground sm:text-base">
          <MapPin className="size-4 shrink-0" />
          {ticket.location}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <User className="size-4 shrink-0" />
          {showAssignee ? ticket.assigneeName ?? "Sem responsável" : "—"}
        </span>
        <span className="text-muted-foreground tabular-nums">{formatAge(ticket.ageMinutes)}</span>
        {isSlaHighlighted(ticket.slaState) && (
          <span className={`inline-flex items-center gap-1.5 font-semibold ${SLA_STATE_TEXT_CLASS[ticket.slaState]}`}>
            <AlertTriangle className="size-4 shrink-0" />
            SLA {SLA_STATE_SHORT_LABEL[ticket.slaState]}
          </span>
        )}
      </div>
    </article>
  );
}
