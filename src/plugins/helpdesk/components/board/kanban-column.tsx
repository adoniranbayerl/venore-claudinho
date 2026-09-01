import type { BoardFeedColumn } from "@/plugins/helpdesk";
import { TicketCard } from "./ticket-card";

// Uma coluna do kanban (§2.6) — cabeçalho com o rótulo do status + a contagem, e a pilha de
// cards. Rola sozinha quando não cabe (a TV fica parada, os cards passam).
export function KanbanColumn({
  column,
  showAssignee,
  showQueue,
}: {
  column: BoardFeedColumn;
  showAssignee: boolean;
  showQueue: boolean;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl bg-muted/40">
      <header className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">{column.label}</h2>
        <span className="text-lg font-bold tabular-nums text-muted-foreground sm:text-xl">{column.tickets.length}</span>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
        {column.tickets.length === 0 ? (
          <p className="px-1 py-4 text-base text-muted-foreground">Nada aqui.</p>
        ) : (
          column.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showAssignee={showAssignee} showQueue={showQueue} />
          ))
        )}
      </div>
    </section>
  );
}
