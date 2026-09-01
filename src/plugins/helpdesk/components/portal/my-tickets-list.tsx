import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { TicketListItem } from "@/plugins/helpdesk";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS } from "@/plugins/helpdesk/shared/ticket-status-display";

export function MyTicketsList({ tickets }: { tickets: TicketListItem[] }) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="Você ainda não abriu chamados"
        description="Use o botão “Abrir chamado” para pedir ajuda das equipes internas."
      />
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            href={`/chamados/${ticket.reference}`}
            className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">{ticket.reference}</span> · {ticket.queueName}
                {ticket.categoryLabel ? ` · ${ticket.categoryLabel}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(ticket.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
