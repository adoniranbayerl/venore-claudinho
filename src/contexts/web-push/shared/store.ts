import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { pushSubscriptions } from "../database/schema";

export type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function upsertSubscription(input: {
  actorId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(pushSubscriptions)
    .values(input)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { actorId: input.actorId, p256dh: input.p256dh, auth: input.auth, userAgent: input.userAgent },
    })
    .returning({ id: pushSubscriptions.id });
  return { id: row.id };
}

export async function deleteByEndpoint(actorId: string, endpoint: string): Promise<number> {
  const rows = await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.actorId, actorId), eq(pushSubscriptions.endpoint, endpoint)))
    .returning({ id: pushSubscriptions.id });
  return rows.length;
}

export async function listByActor(actorId: string): Promise<StoredSubscription[]> {
  return db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.actorId, actorId));
}

export async function deleteById(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  for (const id of ids) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
  }
}
