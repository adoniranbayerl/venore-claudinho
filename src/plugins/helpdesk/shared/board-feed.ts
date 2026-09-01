import {
  TICKET_PRIORITIES,
  type BoardFeedColumn,
  type BoardFeedTicket,
  type BoardFeedView,
  type BoardLayout,
  type TicketListItem,
  type TicketStatus,
} from "../contracts/types";
import { TICKET_STATUS_LABELS_TEAM } from "./ticket-status-display";

// Monta o feed do painel de TV (docs/chamados-plugin.md §2.6) a partir dos TicketListItem já lidos
// (shared/ticket-list-store.ts) e do mapa de nomes de responsável já resolvido (@/contexts/auth).
// Puro e sem I/O — coberto por teste unitário. O service só junta os dados; a forma da tela mora
// aqui, para o `kanban` e o `open_list` dividirem a mesma regra de ordenação e contagem.

// Colunas do kanban, na ordem em que aparecem na TV. `closed`/`cancelled` não entram — o feed nem
// os busca (só chamados ativos).
const KANBAN_STATUSES: TicketStatus[] = ["open", "in_progress", "waiting", "resolved"];

// O `open_list` mostra só o que ainda exige ação — resolvido sai de vista.
const PENDING_STATUSES: TicketStatus[] = ["open", "in_progress", "waiting"];

// urgent > high > normal > low. TICKET_PRIORITIES = ["low","normal","high","urgent"].
function priorityRank(priority: TicketListItem["priority"]): number {
  return TICKET_PRIORITIES.indexOf(priority);
}

// Prioridade desc, depois mais antigo primeiro (quem espera há mais tempo sobe).
function byUrgencyThenAge(a: BoardFeedTicket, b: BoardFeedTicket): number {
  const rank = priorityRank(b.priority) - priorityRank(a.priority);
  if (rank !== 0) return rank;
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export type BuildBoardFeedParams = {
  label: string;
  layout: BoardLayout;
  queueName: string | null;
  showAssignee: boolean;
  refreshSeconds: number;
  tickets: TicketListItem[];
  assigneeNameById: Record<string, string>;
  now?: Date;
};

export function buildBoardFeed(params: BuildBoardFeedParams): BoardFeedView {
  const now = params.now ?? new Date();

  const cards: BoardFeedTicket[] = params.tickets.map((ticket) => ({
    id: ticket.id,
    reference: ticket.reference,
    title: ticket.title,
    queueName: ticket.queueName,
    status: ticket.status,
    priority: ticket.priority,
    categoryLabel: ticket.categoryLabel,
    location: ticket.location,
    assigneeName: ticket.assigneeUserId ? params.assigneeNameById[ticket.assigneeUserId] ?? null : null,
    slaState: ticket.slaState,
    ageMinutes: Math.max(0, Math.round((now.getTime() - ticket.createdAt.getTime()) / 60_000)),
    createdAt: ticket.createdAt,
  }));

  const counts = {
    open: cards.filter((card) => card.status === "open").length,
    inProgress: cards.filter((card) => card.status === "in_progress").length,
    waiting: cards.filter((card) => card.status === "waiting").length,
    resolved: cards.filter((card) => card.status === "resolved").length,
    total: cards.length,
  };

  let columns: BoardFeedColumn[];
  if (params.layout === "open_list") {
    columns = [
      {
        key: "pending",
        label: "Pendentes",
        tickets: cards
          .filter((card) => PENDING_STATUSES.includes(card.status))
          .sort(byUrgencyThenAge),
      },
    ];
  } else {
    columns = KANBAN_STATUSES.map((status) => ({
      key: status,
      label: TICKET_STATUS_LABELS_TEAM[status],
      tickets: cards.filter((card) => card.status === status).sort(byUrgencyThenAge),
    }));
  }

  return {
    label: params.label,
    layout: params.layout,
    queueName: params.queueName,
    showAssignee: params.showAssignee,
    refreshSeconds: params.refreshSeconds,
    generatedAt: now.toISOString(),
    columns,
    counts,
  };
}
