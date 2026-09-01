// Barrel público do plugin (regra 2 do AGENTS.md) — outros plugins/temas/platform só importam
// daqui ou de ./contracts, nunca de ./database/schema, ./features/*/store|service ou ./shared/*.
// Expandido a cada fase de docs/chamados-plugin.md.

export type {
  QueueRecord,
  QueueMemberRecord,
  QueueMemberRole,
  CategoryRecord,
} from "./contracts/types";
export { QUEUE_MEMBER_ROLES } from "./contracts/types";

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

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts).
export { helpdeskSeeds } from "./seeds";
