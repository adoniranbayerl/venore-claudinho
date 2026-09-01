import type { BoardFeedColumn } from "@/plugins/helpdesk";
import { TicketCard } from "./ticket-card";

// Layout `open_list` (§2.6) — uma coluna só, com os chamados pendentes ordenados por prioridade
// (urgente primeiro) e idade. Bom para uma fila única numa oficina: a próxima tarefa fica no topo.
// Mobile-first: 1 coluna, 2 no `md`, 3 no `xl` (parede larga).
export function OpenList({
  column,
  showAssignee,
  showQueue,
}: {
  column: BoardFeedColumn | undefined;
  showAssignee: boolean;
  showQueue: boolean;
}) {
  const tickets = column?.tickets ?? [];

  if (tickets.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center text-2xl font-medium text-muted-foreground">
        Nenhum chamado pendente 🎉
      </p>
    );
  }

  return (
    <div className="grid flex-1 grid-cols-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} showAssignee={showAssignee} showQueue={showQueue} />
      ))}
    </div>
  );
}
