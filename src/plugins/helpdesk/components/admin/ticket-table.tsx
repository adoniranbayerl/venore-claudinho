import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { TicketListItem } from "@/plugins/helpdesk";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS_TEAM } from "@/plugins/helpdesk/shared/ticket-status-display";
import { SLA_STATE_LABEL, SLA_STATE_TEXT_CLASS, isSlaHighlighted } from "@/plugins/helpdesk/shared/sla-display";

// Tabela de chamados da aba Fila (§4). Clicar numa linha abre o drawer de triagem via
// ?tab=<tab>&ticket=<id> (mesmo padrão ?tab= das outras abas do admin). Server component: só o
// drawer é client.
export function TicketTable({
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
    return <EmptyState title={emptyLabel} description="Nada para triar por aqui no momento." />;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            href={`?tab=${tab}&ticket=${ticket.id}`}
            scroll={false}
            className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/60 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                <span className="font-mono">{ticket.reference}</span> · {ticket.queueName}
                {ticket.categoryLabel ? ` · ${ticket.categoryLabel}` : ""}
                {isSlaHighlighted(ticket.slaState) && (
                  <span className={`inline-flex items-center gap-1 font-medium ${SLA_STATE_TEXT_CLASS[ticket.slaState]}`}>
                    <AlertTriangle className="size-3" />
                    {SLA_STATE_LABEL[ticket.slaState]}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {ticket.assigneeUserId ? (userNames[ticket.assigneeUserId] ?? "Atribuído") : "Sem responsável"}
              </span>
              <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>
                {TICKET_STATUS_LABELS_TEAM[ticket.status]}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
