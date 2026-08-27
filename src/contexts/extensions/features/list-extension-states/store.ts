import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { extensionState } from "../../database/schema";
import type { ExtensionKind } from "../../contracts/types";

export async function findExtensionStatesByKind(
  kind: ExtensionKind,
): Promise<{ key: string; enabled: boolean; installedAt: Date | null }[]> {
  return db
    .select({ key: extensionState.key, enabled: extensionState.enabled, installedAt: extensionState.installedAt })
    .from(extensionState)
    .where(eq(extensionState.kind, kind));
}
