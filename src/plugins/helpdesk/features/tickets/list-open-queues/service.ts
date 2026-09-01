import { findActiveCategories, findActiveQueues } from "./store";
import type { ListOpenQueuesResult, PortalQueueOption } from "./types";

export async function listOpenQueues(): Promise<ListOpenQueuesResult> {
  const [queues, categories] = await Promise.all([findActiveQueues(), findActiveCategories()]);

  const categoriesByQueue = new Map<string, { id: string; label: string }[]>();
  for (const category of categories) {
    const list = categoriesByQueue.get(category.queueId) ?? [];
    list.push({ id: category.id, label: category.label });
    categoriesByQueue.set(category.queueId, list);
  }

  const data: PortalQueueOption[] = queues.map((queue) => ({
    id: queue.id,
    key: queue.key,
    name: queue.name,
    icon: queue.icon,
    categories: categoriesByQueue.get(queue.id) ?? [],
  }));

  return { success: true, data };
}
