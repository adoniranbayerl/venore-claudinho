import { asc, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues } from "../../../database/schema";

export async function findActiveQueues(): Promise<{ id: string; key: string; name: string; icon: string | null }[]> {
  return db
    .select({ id: queues.id, key: queues.key, name: queues.name, icon: queues.icon })
    .from(queues)
    .where(isNull(queues.archivedAt))
    .orderBy(asc(queues.position), asc(queues.createdAt), asc(queues.id));
}

export async function findActiveCategories(): Promise<{ id: string; queueId: string; label: string }[]> {
  return db
    .select({ id: categories.id, queueId: categories.queueId, label: categories.label })
    .from(categories)
    .where(isNull(categories.archivedAt))
    .orderBy(asc(categories.position), asc(categories.createdAt), asc(categories.id));
}
