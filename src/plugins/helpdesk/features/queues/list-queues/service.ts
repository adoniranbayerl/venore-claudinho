import { countCategoriesByQueue, countMembersByQueue, findQueues } from "./store";
import type { ListQueuesResult, QueueListItem } from "./types";

// allowedQueueIds recorta pra só as filas em que o ator é membro — passado pelo handler quando
// ele só tem helpdesk.work (não helpdesk.manage/read). undefined = sem recorte.
export async function listQueues(options?: {
  includeArchived?: boolean;
  allowedQueueIds?: string[];
}): Promise<ListQueuesResult> {
  const rows = await findQueues({
    includeArchived: options?.includeArchived ?? false,
    queueIds: options?.allowedQueueIds,
  });

  const ids = rows.map((row) => row.id);
  const [memberCounts, categoryCounts] = await Promise.all([countMembersByQueue(ids), countCategoriesByQueue(ids)]);

  const data: QueueListItem[] = rows.map((row) => ({
    ...row,
    memberCount: memberCounts.get(row.id) ?? 0,
    categoryCount: categoryCounts.get(row.id) ?? 0,
  }));

  return { success: true, data };
}
