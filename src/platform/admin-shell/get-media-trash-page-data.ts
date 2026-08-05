import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Mesmo papel de get-media-page-data.ts, mas atrás de media.purge, não media.manage — a lixeira
// só faz sentido pra quem pode apagar de vez (blob-spec seção 6).
export async function getMediaTrashPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasPurgeAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("media.purge");
  if (!hasPurgeAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
