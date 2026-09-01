// Barrel público do plugin (regra 2 do AGENTS.md) — outros plugins/temas/platform só importam
// daqui ou de ./contracts, nunca de ./database/schema, ./features/*/store|service ou ./shared/*.
// Expandido a cada fase de docs/chamados-plugin.md.

export type {
  QueueRecord,
  QueueMemberRecord,
  QueueMemberRole,
  CategoryRecord,
  TicketRecord,
  TicketStatus,
  TicketPriority,
  TicketEventRecord,
  TicketEventKind,
  TicketEventVisibility,
  TicketAttachmentRecord,
  TicketListItem,
  TicketAttachmentView,
  TicketTimelineEntry,
  TicketDetail,
  HelpdeskNotificationKind,
  HelpdeskNotificationRecord,
  HelpdeskNotificationView,
  SlaState,
  SlaPolicyRecord,
  KioskRecord,
  KioskPublicView,
  PublicTicketView,
  BoardLayout,
  BoardRecord,
  BoardFeedTicket,
  BoardFeedColumn,
  BoardFeedView,
  BoardPublicView,
} from "./contracts/types";
export {
  QUEUE_MEMBER_ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_EVENT_KINDS,
  MAX_TICKET_ATTACHMENTS_PER_SCOPE,
  HELPDESK_NOTIFICATION_KINDS,
  HELPDESK_NOTIFICATIONS_PAGE_SIZE,
  SLA_STATES,
  TICKET_RATING_MIN,
  TICKET_RATING_MAX,
  BOARD_LAYOUTS,
  BOARD_REFRESH_SECONDS_MIN,
  BOARD_REFRESH_SECONDS_MAX,
} from "./contracts/types";

// Fase 1 — filas
export { createQueueHandler as createQueue } from "./features/queues/create-queue/handler";
export { updateQueueHandler as updateQueue } from "./features/queues/update-queue/handler";
export { archiveQueueHandler as archiveQueue } from "./features/queues/archive-queue/handler";
export { listQueuesHandler as listQueues } from "./features/queues/list-queues/handler";
export { setQueueMembersHandler as setQueueMembers } from "./features/queues/set-queue-members/handler";
export { listQueueMembersHandler as listQueueMembers } from "./features/queues/list-queue-members/handler";

export type { CreateQueueInput, CreateQueueResult } from "./features/queues/create-queue/types";
export type { UpdateQueueInput, UpdateQueueResult } from "./features/queues/update-queue/types";
export type { ArchiveQueueInput, ArchiveQueueResult } from "./features/queues/archive-queue/types";
export type { ListQueuesResult, QueueListItem } from "./features/queues/list-queues/types";
export type {
  SetQueueMembersInput,
  SetQueueMembersResult,
  QueueMemberAssignment,
} from "./features/queues/set-queue-members/types";
export type { ListQueueMembersResult } from "./features/queues/list-queue-members/types";

// Fase 1 — categorias
export { createCategoryHandler as createCategory } from "./features/categories/create-category/handler";
export { updateCategoryHandler as updateCategory } from "./features/categories/update-category/handler";
export { archiveCategoryHandler as archiveCategory } from "./features/categories/archive-category/handler";
export { listCategoriesHandler as listCategories } from "./features/categories/list-categories/handler";

export type { CreateCategoryInput, CreateCategoryResult } from "./features/categories/create-category/types";
export type { UpdateCategoryInput, UpdateCategoryResult } from "./features/categories/update-category/types";
export type { ArchiveCategoryInput, ArchiveCategoryResult } from "./features/categories/archive-category/types";
export type { ListCategoriesResult } from "./features/categories/list-categories/types";

// Resumo de acesso do ator (quais filas configura/atende, se lê tudo)
export { getMyHelpdeskAccessHandler as getMyHelpdeskAccess } from "./features/access/get-my-helpdesk-access/handler";
export type { HelpdeskAccess, GetMyHelpdeskAccessResult } from "./features/access/get-my-helpdesk-access/types";

// Fase 2 — chamados, timeline e anexos (docs/chamados-plugin.md §2.2, §5)
export { openTicketHandler as openTicket } from "./features/tickets/open-ticket/handler";
export { listOpenQueuesHandler as listOpenQueues } from "./features/tickets/list-open-queues/handler";
export { listMyTicketsHandler as listMyTickets } from "./features/tickets/list-my-tickets/handler";
export { listTicketsHandler as listTickets } from "./features/tickets/list-tickets/handler";
export { getTicketHandler as getTicket } from "./features/tickets/get-ticket/handler";
export { addCommentHandler as addComment } from "./features/tickets/add-comment/handler";
export { changeStatusHandler as changeStatus } from "./features/tickets/change-status/handler";
export { changePriorityHandler as changePriority } from "./features/tickets/change-priority/handler";
export { assignTicketHandler as assignTicket } from "./features/tickets/assign-ticket/handler";
export { addTicketAttachmentHandler as addTicketAttachment } from "./features/attachments/add-ticket-attachment/handler";
export { listTicketAttachmentsHandler as listTicketAttachments } from "./features/attachments/list-ticket-attachments/handler";

export { parseTicketReference, formatTicketReference } from "./shared/ticket-reference";

export type { OpenTicketInput, OpenTicketResult } from "./features/tickets/open-ticket/types";
export type { ListOpenQueuesResult, PortalQueueOption } from "./features/tickets/list-open-queues/types";
export type { ListMyTicketsResult } from "./features/tickets/list-my-tickets/types";
export type { ListTicketsQuery, ListTicketsResult } from "./features/tickets/list-tickets/types";
export type { GetTicketQuery, GetTicketResult } from "./features/tickets/get-ticket/types";
export type { AddCommentInput, AddCommentResult } from "./features/tickets/add-comment/types";
export type { ChangeStatusInput, ChangeStatusResult } from "./features/tickets/change-status/types";
export type { ChangePriorityInput, ChangePriorityResult } from "./features/tickets/change-priority/types";
export type { AssignTicketInput, AssignTicketResult } from "./features/tickets/assign-ticket/types";
export type {
  AddTicketAttachmentInput,
  AddTicketAttachmentResult,
} from "./features/attachments/add-ticket-attachment/types";
export type { ListTicketAttachmentsResult } from "./features/attachments/list-ticket-attachments/types";

// Fase 3 — notificações in-app (docs/chamados-plugin.md §2.3)
export { listMyNotificationsHandler as listMyNotifications } from "./features/notifications/list-my-notifications/handler";
export { markNotificationsReadHandler as markNotificationsRead } from "./features/notifications/mark-notifications-read/handler";
export { getUnreadCountHandler as getUnreadCount } from "./features/notifications/get-unread-count/handler";

export type { ListMyNotificationsResult } from "./features/notifications/list-my-notifications/types";
export type {
  MarkNotificationsReadInput,
  MarkNotificationsReadResult,
} from "./features/notifications/mark-notifications-read/types";
export type { GetUnreadCountResult } from "./features/notifications/get-unread-count/types";

// Fase 4 — prioridade e SLA (docs/chamados-plugin.md §2.4)
export { setSlaPolicyHandler as setSlaPolicy } from "./features/sla/set-sla-policy/handler";
export { listSlaPoliciesHandler as listSlaPolicies } from "./features/sla/list-sla-policies/handler";
export { sweepSlaAtRiskHandler as sweepSlaAtRisk } from "./features/sla/sweep-sla-at-risk/handler";

export type { SetSlaPolicyInput, SetSlaPolicyResult } from "./features/sla/set-sla-policy/types";
export type { ListSlaPoliciesResult, SlaPolicyRow } from "./features/sla/list-sla-policies/types";
export {
  SLA_STATE_TEXT_CLASS,
  SLA_STATE_LABEL,
  SLA_STATE_SHORT_LABEL,
  isSlaHighlighted,
  TICKET_PRIORITY_LABELS,
  formatSlaMinutes,
} from "./shared/sla-display";
export { DEFAULT_SLA_MINUTES } from "./shared/sla";

// Fase 5 — quiosque anônimo por QR (docs/chamados-plugin.md §2.5)
export { createKioskHandler as createKiosk } from "./features/kiosks/create-kiosk/handler";
export { updateKioskHandler as updateKiosk } from "./features/kiosks/update-kiosk/handler";
export { listKiosksHandler as listKiosks } from "./features/kiosks/list-kiosks/handler";
export { getKioskByTokenHandler as getKioskByToken } from "./features/kiosks/get-kiosk-by-token/handler";
export { submitKioskTicketHandler as submitKioskTicket } from "./features/tickets/submit-kiosk-ticket/handler";
export { getTicketByTrackingTokenHandler as getTicketByTrackingToken } from "./features/tickets/get-ticket-by-tracking-token/handler";
export { addTrackingCommentHandler as addTrackingComment } from "./features/tickets/add-tracking-comment/handler";
export { rateTicketHandler as rateTicket } from "./features/tickets/rate-ticket/handler";

export type { CreateKioskInput, CreateKioskResult } from "./features/kiosks/create-kiosk/types";
export type { UpdateKioskInput, UpdateKioskResult } from "./features/kiosks/update-kiosk/types";
export type { ListKiosksResult, KioskListItem } from "./features/kiosks/list-kiosks/types";
export type { GetKioskByTokenResult } from "./features/kiosks/get-kiosk-by-token/types";
export type { SubmitKioskTicketInput, SubmitKioskTicketResult } from "./features/tickets/submit-kiosk-ticket/types";
export type { GetTicketByTrackingTokenResult } from "./features/tickets/get-ticket-by-tracking-token/types";
export type { AddTrackingCommentInput, AddTrackingCommentResult } from "./features/tickets/add-tracking-comment/types";
export type { RateTicketInput, RateTicketResult } from "./features/tickets/rate-ticket/types";

// Fase 6 — painel de TV / kanban (docs/chamados-plugin.md §2.6)
export { createBoardHandler as createBoard } from "./features/boards/create-board/handler";
export { updateBoardHandler as updateBoard } from "./features/boards/update-board/handler";
export { deleteBoardHandler as deleteBoard } from "./features/boards/delete-board/handler";
export { listBoardsHandler as listBoards } from "./features/boards/list-boards/handler";
export { getBoardHandler as getBoard } from "./features/boards/get-board/handler";
export { getBoardFeedHandler as getBoardFeed } from "./features/boards/get-board-feed/handler";

export type { CreateBoardInput, CreateBoardResult } from "./features/boards/create-board/types";
export type { UpdateBoardInput, UpdateBoardResult } from "./features/boards/update-board/types";
export type { DeleteBoardInput, DeleteBoardResult } from "./features/boards/delete-board/types";
export type { ListBoardsResult, BoardListItem } from "./features/boards/list-boards/types";
export type { GetBoardResult } from "./features/boards/get-board/types";
export type { GetBoardFeedResult } from "./features/boards/get-board-feed/types";

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts).
export { helpdeskSeeds } from "./seeds";
