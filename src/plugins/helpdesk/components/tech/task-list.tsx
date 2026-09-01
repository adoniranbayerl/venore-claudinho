import Link from "next/link";
import { AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { TicketListItem } from "@/plugins/helpdesk";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS_TEAM } from "@/plugins/helpdesk/shared/ticket-status-display";
import { SLA_STATE_SHORT_LABEL, SLA_STATE_TEXT_CLASS, isSlaHighlighted } from "@/plugins/helpdesk/shared/sla-display";

// Lista enxuta do app do técnico (§4) — mobile-first: um cartão por linha, toque abre o detalhe
// (?tab=<tab>&ticket=<id>) na mesma tela. Presentational puro.
export function TaskList({
  tickets,
  tab,
  userNames,
  emptyLabel,
}: {
  tickets: TicketListItem[];
  tab: string;
  userNames: Record<string, string>;
  emptyLabel: string;
}) {
  if (tickets.length === 0) {
    return <EmptyState title={emptyLabel} description="Nada para fazer agora." />;
  }

  return (
    <ul className="space-y-2">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            href={`?tab=${tab}&ticket=${ticket.id}`}
            className="block rounded-xl border border-border bg-card p-3 hover:bg-muted/60"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {ticket.reference}
              </Badge>
              <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>
                {TICKET_STATUS_LABELS_TEAM[ticket.status]}
              </Badge>
              {isSlaHighlighted(ticket.slaState) && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${SLA_STATE_TEXT_CLASS[ticket.slaState]}`}>
                  <AlertTriangle className="size-3" />
                  {SLA_STATE_SHORT_LABEL[ticket.slaState]}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium text-foreground">{ticket.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>{ticket.queueName}</span>
              {ticket.categoryLabel ? <span>· {ticket.categoryLabel}</span> : null}
              {ticket.location ? (
                <span className="inline-flex items-center gap-1">
                  · <MapPin className="size-3" />
                  {ticket.location}
                </span>
              ) : null}
              {ticket.assigneeUserId ? (
                <span>· {userNames[ticket.assigneeUserId] ?? "responsável definido"}</span>
              ) : (
                <span>· sem responsável</span>
              )}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
