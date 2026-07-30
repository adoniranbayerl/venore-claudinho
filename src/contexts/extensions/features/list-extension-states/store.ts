import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { extensionState } from "../../database/schema";
import type { ExtensionKind } from "../../contracts/types";

export async function findExtensionStatesByKind(kind: ExtensionKind): Promise<{ key: string; enabled: boolean }[]> {
  return db
    .select({ key: extensionState.key, enabled: extensionState.enabled })
    .from(extensionState)
    .where(eq(extensionState.kind, kind));
}
