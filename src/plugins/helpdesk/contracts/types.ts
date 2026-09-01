// Superfície pública do plugin (barrel index.ts + contracts/) — o que outros plugins/temas/
// platform podem importar. Nada de store/service interno aqui.
// Ver docs/chamados-plugin.md §2.1 (Fase 1).

export const QUEUE_MEMBER_ROLES = ["manager", "agent"] as const;
export type QueueMemberRole = (typeof QUEUE_MEMBER_ROLES)[number];

// Uma fila / equipe de atendimento (TI, Manutenção… depois Zeladoria, Frota etc.). `key` é slug
// gerado do nome na criação, nunca digitado nem reeditável — vira parte da URL de painéis e do
// prefixo do número do chamado (`{key}-{seq}`), trocar depois quebraria um link já compartilhado.
// `icon` é nome de ícone lucide de uma lista fixa (só identidade visual). `archivedAt != null`
// esconde a fila das listagens sem apagar histórico.
export type QueueRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
  // Fase 4 (§2.4) — prioridade herdada pelo chamado que nasce sem categoria (ou cuja categoria
  // não fixa uma própria).
  defaultPriority: TicketPriority;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Delegação por fila (§3). `userId` é `text` solto sem FK — o plugin não importa
// contexts/auth/database/schema; nome/e-mail resolvidos via @/contexts/auth `listUsers`. Uma
// linha por (fila, pessoa): a pessoa tem exatamente um papel na fila. `manager` configura a fila
// (categorias, membros `agent`) e atende; `agent` só atende. Estar aqui NÃO substitui a
// permission `helpdesk.work` — é restrição a mais sobre ela (ver shared/scoped-authorization).
export type QueueMemberRecord = {
  queueId: string;
  userId: string;
  role: QueueMemberRole;
  assignedAt: Date;
};

// Categoria opcional dentro de uma fila ("Rede", "Impressora", "Ar-condicionado", "Elétrica").
// `key` é slug gerado, único por fila. `archivedAt` aposenta a categoria sem quebrar chamados
// antigos. Prioridade padrão por categoria entra na Fase 4 (junto com o enum de prioridade).
export type CategoryRecord = {
  id: string;
  queueId: string;
  key: string;
  label: string;
  description: string | null;
  position: number;
  // Fase 4 (§2.1/§2.4) — null = o chamado herda o `defaultPriority` da fila.
  defaultPriority: TicketPriority | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ── Fase 2 — chamado, timeline e anexos (docs/chamados-plugin.md §2.2, §5) ──────────────────────

// Ciclo de vida em §5. `open` recém-criado sem responsável; `waiting` aguardando o solicitante;
// `resolved` técnico marcou resolvido (só assignee/manager); `closed` admin conferiu (só
// helpdesk.manage); `cancelled` terminal.
export const TICKET_STATUSES = ["open", "in_progress", "waiting", "resolved", "closed", "cancelled"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_FINAL_STATUSES = ["closed", "cancelled"] as const;

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

// ── Fase 4 — SLA (docs/chamados-plugin.md §2.4, §5) ────────────────────────────────────────────

// Estado do SLA de resolução de um chamado, derivado (nunca persistido) de
// `slaDueAt`/`resolvedAt`/`createdAt` por shared/sla.ts. `none` = a fila não tem política p/ a
// prioridade; `at_risk` = passou de 80 % do prazo sem resolver; `breached` = prazo estourado sem
// resolver. Realce de cor (`text-warning`/`text-destructive`) em shared/sla-display.ts.
export const SLA_STATES = ["none", "ok", "at_risk", "breached"] as const;
export type SlaState = (typeof SLA_STATES)[number];

// Uma linha de sla_policies — política por (fila, prioridade). Minutos corridos (24/7) a partir da
// abertura / do último priority_change.
export type SlaPolicyRecord = {
  queueId: string;
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

// Um item da timeline: histórico + comentários no mesmo lugar (§2.2).
export const TICKET_EVENT_KINDS = [
  "created",
  "comment",
  "status_change",
  "assignment",
  "priority_change",
  "queue_transfer",
  "category_change",
  "reopened",
  "rating",
] as const;
export type TicketEventKind = (typeof TICKET_EVENT_KINDS)[number];

export const TICKET_EVENT_VISIBILITIES = ["public", "internal"] as const;
export type TicketEventVisibility = (typeof TICKET_EVENT_VISIBILITIES)[number];

export type TicketRecord = {
  id: string;
  queueId: string;
  categoryId: string | null;
  seq: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeUserId: string | null;
  requesterUserId: string | null;
  location: string | null;
  // Fase 4 (§2.4) — now + resolution_minutes da política vigente; null = fila sem política.
  slaDueAt: Date | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TicketEventRecord = {
  id: string;
  ticketId: string;
  kind: TicketEventKind;
  authorUserId: string | null;
  authorLabel: string | null;
  visibility: TicketEventVisibility;
  body: string | null;
  meta: { from?: string | null; to?: string | null; score?: number } | null;
  createdAt: Date;
};

export type TicketAttachmentRecord = {
  id: string;
  ticketId: string;
  eventId: string | null;
  mediaId: string;
  uploadedByUserId: string | null;
  createdAt: Date;
};

// Máximo de anexos por escopo (chamado na abertura, ou um comentário) — §2.2.
export const MAX_TICKET_ATTACHMENTS_PER_SCOPE = 3;

// ── Views (presenters) — o que sai de list-tickets / get-ticket pra UI ─────────────────────────

export type TicketListItem = {
  id: string;
  reference: string;
  queueId: string;
  queueName: string;
  seq: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryLabel: string | null;
  location: string | null;
  assigneeUserId: string | null;
  requesterUserId: string | null;
  // Fase 4 (§5) — SLA de resolução: `slaDueAt` cru + o estado já derivado (`text-warning` /
  // `text-destructive` via shared/sla-display.ts). O consumidor (tabela, drawer, app do técnico,
  // painel de TV) só pinta.
  slaDueAt: Date | null;
  slaState: SlaState;
  createdAt: Date;
  updatedAt: Date;
};

// media_* vem de @/contexts/media (getMediaAsset / getMediaAssetForTrustedReview) — null quando o
// asset foi apagado ou está indisponível.
export type TicketAttachmentView = {
  id: string;
  eventId: string | null;
  mediaId: string;
  uploadedByUserId: string | null;
  createdAt: Date;
  mediaUrl: string | null;
  mediaFilename: string | null;
  mediaContentType: string | null;
};

export type TicketTimelineEntry = {
  id: string;
  kind: TicketEventKind;
  authorUserId: string | null;
  authorLabel: string | null;
  visibility: TicketEventVisibility;
  body: string | null;
  meta: { from?: string | null; to?: string | null; score?: number } | null;
  createdAt: Date;
  attachments: TicketAttachmentView[];
};

export type TicketDetail = {
  ticket: TicketRecord;
  reference: string;
  queue: { id: string; key: string; name: string };
  category: { id: string; label: string } | null;
  timeline: TicketTimelineEntry[];
  attachments: TicketAttachmentView[];
  // true quando quem pediu vê as notas `internal` (equipe/liderança); false para o solicitante.
  canSeeInternal: boolean;
  // Fase 4 (§5) — SLA de resolução derivado (mesma regra do TicketListItem).
  slaState: SlaState;
};

// ── Fase 3 — notificações in-app (docs/chamados-plugin.md §2.3) ─────────────────────────────────

// `sla_at_risk` entra na Fase 4 e `rating_received` na Fase 7 — o enum já contempla os dois pra a
// migration não precisar recriar o check depois.
export const HELPDESK_NOTIFICATION_KINDS = [
  "new_ticket",
  "assigned_to_you",
  "comment_added",
  "needs_info",
  "status_changed",
  "resolved",
  "reopened",
  "sla_at_risk",
  "rating_received",
] as const;
export type HelpdeskNotificationKind = (typeof HELPDESK_NOTIFICATION_KINDS)[number];

export type HelpdeskNotificationRecord = {
  id: string;
  recipientUserId: string;
  ticketId: string;
  kind: HelpdeskNotificationKind;
  summary: string;
  readAt: Date | null;
  createdAt: Date;
};

// O que sai de list-my-notifications pra UI — a linha pronta + o número do chamado pra montar o
// link (`/chamados/{reference}` ou o drawer `?tab=fila&ticket=<ticketId>`).
export type HelpdeskNotificationView = {
  id: string;
  ticketId: string;
  reference: string;
  kind: HelpdeskNotificationKind;
  summary: string;
  readAt: Date | null;
  createdAt: Date;
};

// Quantas notificações uma consulta de lista devolve por padrão (§2.3, "últimas N").
export const HELPDESK_NOTIFICATIONS_PAGE_SIZE = 30;

// ── Fase 5 — quiosque anônimo por QR (docs/chamados-plugin.md §2.5) ─────────────────────────────

// Um ponto de abertura sem login. `token` vai no QR Code colado no setor. `queueId` null = o
// solicitante escolhe a fila no formulário; preenchido = fila fixada pelo quiosque.
// `defaultLocation` pré-preenche o campo de local. `active = false` desliga sem apagar histórico.
export type KioskRecord = {
  id: string;
  token: string;
  label: string;
  queueId: string | null;
  defaultLocation: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// O que a página pública do quiosque (/chamados/quiosque/[token]) precisa para montar o formulário
// curto — sem nenhum dado sensível: rótulo, fila fixada (se houver) e, quando a fila é aberta, a
// lista de filas para o solicitante escolher.
export type KioskPublicView = {
  token: string;
  label: string;
  fixedQueue: { id: string; name: string } | null;
  defaultLocation: string | null;
  // Preenchida só quando `fixedQueue` é null — o solicitante escolhe uma destas.
  queues: { id: string; name: string }[];
};

// Nota de avaliação do atendimento (§2.5 / §2.2 `rating_score`). A denormalização em
// `tickets.rating_score` + o relatório entram na Fase 7; a Fase 5 grava só o evento `rating`.
export const TICKET_RATING_MIN = 1;
export const TICKET_RATING_MAX = 5;

// ── Fase 6 — painel de TV / kanban (docs/chamados-plugin.md §2.6) ──────────────────────────────

// `kanban` = colunas por status (aberto / em andamento / aguardando / resolvido). `open_list` =
// uma coluna só, com os chamados pendentes ordenados por prioridade (urgente primeiro) e idade.
export const BOARD_LAYOUTS = ["kanban", "open_list"] as const;
export type BoardLayout = (typeof BOARD_LAYOUTS)[number];

// Uma tela salva. `token` vai na URL `/chamados/painel/[token]` (servida fora da shell). `queueId`
// null = todas as filas. `refreshSeconds` é o intervalo de polling da página (§2.6).
export type BoardRecord = {
  id: string;
  token: string;
  label: string;
  queueId: string | null;
  layout: BoardLayout;
  showAssignee: boolean;
  refreshSeconds: number;
  createdAt: Date;
  updatedAt: Date;
};

// Limites de `refresh_seconds` — rápido o suficiente para uma sala de operação, sem martelar o
// endpoint. Default do schema = 20.
export const BOARD_REFRESH_SECONDS_MIN = 5;
export const BOARD_REFRESH_SECONDS_MAX = 600;

// Um card do painel — o mínimo legível a 3 m. Sem UUID de usuário: `assigneeName` já resolvido
// (via @/contexts/auth), `null` = sem responsável.
export type BoardFeedTicket = {
  id: string;
  reference: string;
  title: string;
  queueName: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryLabel: string | null;
  location: string | null;
  assigneeName: string | null;
  // Fase 4 (§5) — realce de SLA já derivado; o card só pinta (`text-warning`/`text-destructive`).
  slaState: SlaState;
  // now - createdAt em minutos, para o "há 2h" do card sem enviar relógio do servidor cru.
  ageMinutes: number;
  createdAt: Date;
};

// Uma coluna do painel. No `kanban` há uma por status (`key` = TicketStatus); no `open_list` há
// uma só (`key` = "pending").
export type BoardFeedColumn = {
  key: string;
  label: string;
  tickets: BoardFeedTicket[];
};

// O que sai de get-board-feed (polling) e o que o get-board devolve para a casca da página.
export type BoardFeedView = {
  label: string;
  layout: BoardLayout;
  // null = painel de todas as filas.
  queueName: string | null;
  showAssignee: boolean;
  refreshSeconds: number;
  // ISO — quando o feed foi montado (o rodapé do painel mostra "atualizado às HH:MM").
  generatedAt: string;
  columns: BoardFeedColumn[];
  // Contadores do topo do painel (sempre sobre o escopo do painel, não só a coluna visível).
  counts: { open: number; inProgress: number; waiting: number; resolved: number; total: number };
};

// O que a casca da página `/chamados/painel/[token]` precisa antes do primeiro polling: rótulo,
// layout e o intervalo. Sem os cards (esses vêm do feed).
export type BoardPublicView = {
  label: string;
  layout: BoardLayout;
  queueName: string | null;
  showAssignee: boolean;
  refreshSeconds: number;
};

// Timeline pública de um chamado acompanhado por `tracking_token` (§2.5) — só eventos `public`,
// sem nomes de usuário internos, sem notas `internal`. Espelha o mínimo do TicketDetail que a
// página de acompanhamento anônima precisa.
export type PublicTicketView = {
  reference: string;
  queueName: string;
  categoryLabel: string | null;
  title: string;
  description: string;
  status: TicketStatus;
  location: string | null;
  requesterName: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  timeline: TicketTimelineEntry[];
  // true quando o chamado já foi resolvido/fechado — a página mostra o convite de avaliação.
  canRate: boolean;
  // score já registrado (último evento `rating`), null se ainda não avaliado.
  ratingScore: number | null;
};
