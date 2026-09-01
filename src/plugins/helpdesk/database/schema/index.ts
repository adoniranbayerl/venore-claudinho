import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgSchema, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const helpdeskSchema = pgSchema("helpdesk");

// Fase 1 — docs/chamados-plugin.md §2.1. Notificações/SLA/quiosques/painéis entram nas fases
// seguintes, cada uma com sua própria migration. Fase 2 (abaixo, a partir de `tickets`): chamado,
// timeline e anexos (§2.2).

// key é slug do nome, gerado em create-queue/service.ts (nunca digitado, nunca reeditado) — vira
// parte da URL dos painéis e do prefixo do número do chamado. archived_at != null esconde a fila
// das listagens sem apagar histórico.
export const queues = helpdeskSchema.table(
  "queues",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // Nome de ícone lucide (ex: "wrench") escolhido numa lista fixa — não é cor nem valor de
    // design, só um enum de identidade visual da fila. null cai num ícone padrão.
    icon: text("icon"),
    position: integer("position").notNull().default(0),
    // Fase 4 (§2.4) — prioridade que o chamado herda quando nasce sem categoria (ou a categoria
    // não fixa uma própria). `normal` no schema legado da Fase 1.
    defaultPriority: text("default_priority").notNull().default("normal"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("helpdesk_queues_key_idx").on(table.key),
    check("helpdesk_queues_default_priority_check", sql`${table.defaultPriority} in ('low','normal','high','urgent')`),
  ],
);

// Delegação por fila (§3). user_id é texto solto sem FK — mesmo racional de
// company_metrics.sector_members / broadcast_agenda_editors (plugin não importa
// contexts/auth/database/schema). Uma linha por (fila, pessoa). role = "manager" configura a
// fila e delega "agent"; role = "agent" só atende. Só helpdesk.manage delega/remove "manager".
export const queueMembers = helpdeskSchema.table(
  "queue_members",
  {
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.queueId, table.userId] }),
    check("helpdesk_queue_members_role_check", sql`${table.role} in ('manager','agent')`),
  ],
);

// Categoria opcional de uma fila ("Rede", "Impressora", "Ar-condicionado", "Elétrica"). key é
// slug do label, único por fila. archived_at aposenta sem quebrar chamados antigos.
export const categories = helpdeskSchema.table(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
    // Fase 4 (§2.1/§2.4) — prioridade padrão da categoria; null = o chamado herda o
    // `default_priority` da fila.
    defaultPriority: text("default_priority"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("helpdesk_categories_key_idx").on(table.queueId, table.key),
    check(
      "helpdesk_categories_default_priority_check",
      sql`${table.defaultPriority} is null or ${table.defaultPriority} in ('low','normal','high','urgent')`,
    ),
  ],
);

// ── Fase 2 — chamado, timeline e anexos (docs/chamados-plugin.md §2.2) ──────────────────────────

// Sequência por fila (`{queue.key}-{seq}`), gerada em transação no open-ticket/service.ts com
// UPDATE ... RETURNING. `next_seq` = próximo número a distribuir (começa em 1). Serializa a
// criação de chamado por fila — aceitável no volume de uma rede interna (§8).
export const ticketCounters = helpdeskSchema.table("ticket_counters", {
  queueId: text("queue_id")
    .primaryKey()
    .references(() => queues.id, { onDelete: "cascade" }),
  nextSeq: integer("next_seq").notNull().default(1),
});

// Um chamado. user_id/category_id são texto solto (nome/e-mail resolvidos via @/contexts/auth).
// Número exibido = `{queue.key}-{seq}`. `priority` já existe no schema mas a Fase 2 fixa "normal"
// (o enum e o cálculo de SLA entram na Fase 4). Colunas de quiosque anônimo (requester_name,
// tracking_token, origin_kiosk_id) e de SLA/avaliação entram nas fases 4/5/7.
export const tickets = helpdeskSchema.table(
  "tickets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    seq: integer("seq").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("normal"),
    assigneeUserId: text("assignee_user_id"),
    requesterUserId: text("requester_user_id"),
    // Fase 5 (§2.5) — quiosque anônimo: sem `requester_user_id`, o solicitante se identifica só
    // por nome livre + contato opcional ("ramal 32 / João da recepção"). `origin_kiosk_id` liga o
    // chamado ao ponto de abertura; `tracking_token` é o link de acompanhamento sem login.
    requesterName: text("requester_name"),
    requesterContact: text("requester_contact"),
    originKioskId: text("origin_kiosk_id").references(() => kiosks.id, { onDelete: "set null" }),
    trackingToken: text("tracking_token"),
    location: text("location"),
    // Fase 4 (§2.4) — recalculado na abertura e a cada priority_change: now + resolution_minutes
    // da política da fila para a prioridade corrente. null = a fila não tem política p/ a prioridade.
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    // Fase 7 (§2.2, §5) — `reopened_count` conta quantas vezes o solicitante reabriu o chamado
    // dentro da janela de N dias (reopen-ticket incrementa em transação). `rating_score` é a nota
    // (1..5) denormalizada do último evento `rating` — rate-ticket grava as duas coisas juntas; a
    // aba Relatório lê daqui.
    reopenedCount: integer("reopened_count").notNull().default(0),
    ratingScore: integer("rating_score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("helpdesk_tickets_queue_seq_idx").on(table.queueId, table.seq),
    uniqueIndex("helpdesk_tickets_tracking_token_idx").on(table.trackingToken),
    index("helpdesk_tickets_queue_status_idx").on(table.queueId, table.status),
    index("helpdesk_tickets_requester_idx").on(table.requesterUserId),
    index("helpdesk_tickets_assignee_idx").on(table.assigneeUserId),
    check(
      "helpdesk_tickets_status_check",
      sql`${table.status} in ('open','in_progress','waiting','resolved','closed','cancelled')`,
    ),
    check("helpdesk_tickets_priority_check", sql`${table.priority} in ('low','normal','high','urgent')`),
    check(
      "helpdesk_tickets_rating_score_check",
      sql`${table.ratingScore} is null or ${table.ratingScore} between 1 and 5`,
    ),
  ],
);

// Timeline única do chamado — histórico (status_change/assignment/…) e comentários no mesmo
// lugar, ordenados por created_at. É a fonte de verdade da auditoria do chamado: toda mudança de
// estado grava um evento correspondente no mesmo service. `visibility` = "public" (o solicitante
// vê) ou "internal" (só a equipe). `meta` guarda `{ from, to }` das mudanças.
export const ticketEvents = helpdeskSchema.table(
  "ticket_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    authorUserId: text("author_user_id"),
    authorLabel: text("author_label"),
    visibility: text("visibility").notNull().default("public"),
    body: text("body"),
    // `{ from, to }` das mudanças de estado; `{ score }` (1..5) do evento `rating` da Fase 5
    // (§2.5) — a denormalização em `tickets.rating_score` + relatório é Fase 7.
    meta: jsonb("meta").$type<{ from?: string | null; to?: string | null; score?: number }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("helpdesk_ticket_events_ticket_idx").on(table.ticketId, table.createdAt),
    check(
      "helpdesk_ticket_events_kind_check",
      sql`${table.kind} in ('created','comment','status_change','assignment','priority_change','queue_transfer','category_change','reopened','rating')`,
    ),
    check("helpdesk_ticket_events_visibility_check", sql`${table.visibility} in ('public','internal')`),
  ],
);

// Anexo preso ao chamado (event_id null) ou a um comentário específico (event_id != null).
// media_id é texto solto — resolvido via @/contexts/media getMediaAsset/getMediaAssetForTrustedReview.
// Máx. 3 por chamado (na abertura) e por comentário — regra no validation.ts + reforçada no service.
export const ticketAttachments = helpdeskSchema.table(
  "ticket_attachments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => ticketEvents.id, { onDelete: "cascade" }),
    mediaId: text("media_id").notNull(),
    uploadedByUserId: text("uploaded_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("helpdesk_ticket_attachments_ticket_idx").on(table.ticketId)],
);

// ── Fase 3 — notificações in-app (docs/chamados-plugin.md §2.3) ─────────────────────────────────

// Uma linha por (destinatário × evento). `recipient_user_id` é texto solto sem FK — nome/e-mail
// resolvidos via @/contexts/auth (o plugin não importa contexts/auth/database/schema). Sem
// e-mail/push no v1: só linha no banco, entregue por polling (~30 s) em GET /api/helpdesk/
// notifications. Criada pelo mesmo service que faz a ação, via shared/notify.ts (destinatários =
// queue_members da fila + assignee + requester_user_id, deduplicado, nunca o autor da ação).
// `summary` já vem pronto pra lista ("Manutenção · manutencao-87 · novo chamado"). Índice
// (recipient_user_id, read_at, created_at desc) serve a listagem e o contador de não lidas.
export const helpdeskNotifications = helpdeskSchema.table(
  "helpdesk_notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipientUserId: text("recipient_user_id").notNull(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("helpdesk_notifications_recipient_idx").on(
      table.recipientUserId,
      table.readAt,
      table.createdAt.desc(),
    ),
    check(
      "helpdesk_notifications_kind_check",
      sql`${table.kind} in ('new_ticket','assigned_to_you','comment_added','needs_info','status_changed','resolved','reopened','sla_at_risk','rating_received')`,
    ),
  ],
);

// ── Fase 4 — prioridade e SLA (docs/chamados-plugin.md §2.4) ────────────────────────────────────

// Política de SLA por (fila, prioridade). v1: HORAS CORRIDAS (24/7) — pausa em "aguardando" e
// horário comercial são Fase 8. `first_response_minutes`/`resolution_minutes` contam a partir da
// abertura do chamado e recontam a cada priority_change. Fila sem linha para uma prioridade cai no
// padrão de shared/sla.ts (DEFAULT_SLA_MINUTES). pk composta (queueId, priority).
export const slaPolicies = helpdeskSchema.table(
  "sla_policies",
  {
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "cascade" }),
    priority: text("priority").notNull(),
    firstResponseMinutes: integer("first_response_minutes").notNull(),
    resolutionMinutes: integer("resolution_minutes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.queueId, table.priority] }),
    check("helpdesk_sla_policies_priority_check", sql`${table.priority} in ('low','normal','high','urgent')`),
  ],
);

// ── Fase 5 — quiosque anônimo por QR (docs/chamados-plugin.md §2.5) ─────────────────────────────

// Ponto de abertura sem login: um QR Code colado no setor aponta para /chamados/quiosque/[token].
// `token` é hex aleatório (nunca sequencial), vai no QR. `queue_id` null = o solicitante escolhe a
// fila no formulário; preenchido = fila fixada pelo quiosque ("QR da Manutenção"). `default_location`
// pré-preenche o campo de local. `active = false` desliga o quiosque sem apagar o histórico dos
// chamados que ele originou (a FK em tickets.origin_kiosk_id é `set null`, não cascade).
export const kiosks = helpdeskSchema.table(
  "kiosks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    token: text("token").notNull(),
    label: text("label").notNull(),
    queueId: text("queue_id").references(() => queues.id, { onDelete: "set null" }),
    defaultLocation: text("default_location"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("helpdesk_kiosks_token_idx").on(table.token)],
);

// ── Fase 6 — painel de TV / kanban (docs/chamados-plugin.md §2.6) ──────────────────────────────

// Um painel salvo, um `token` próprio por tela (quantos quiser — uma TV na Manutenção, outra na
// TI, outra na recepção). `token` é hex aleatório, vai na URL `/chamados/painel/[token]`, servido
// FORA da shell do (platform) por um shim de reexport (§4). `queue_id` null = o painel mostra
// todas as filas; preenchido = recorta numa fila (FK `cascade` — some a fila, some o painel).
// `layout` = "kanban" (colunas por status) ou "open_list" (só os pendentes, por prioridade).
// A página faz polling a cada `refresh_seconds` em GET /api/helpdesk/board/[token] (§2.6); SSE
// (precedente broadcast) é Fase 8.
export const boards = helpdeskSchema.table(
  "boards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    token: text("token").notNull(),
    label: text("label").notNull(),
    queueId: text("queue_id").references(() => queues.id, { onDelete: "cascade" }),
    layout: text("layout").notNull().default("kanban"),
    showAssignee: boolean("show_assignee").notNull().default(true),
    refreshSeconds: integer("refresh_seconds").notNull().default(20),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("helpdesk_boards_token_idx").on(table.token),
    check("helpdesk_boards_layout_check", sql`${table.layout} in ('kanban','open_list')`),
  ],
);
