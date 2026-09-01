import { authorizeActor } from "@/contexts/rbac";
import { listBoardsForAdmin } from "./service";
import type { ListBoardsResult } from "./types";

// Aba Painéis do admin (§2.6) — só `helpdesk.manage`.
export async function listBoardsHandler(): Promise<ListBoardsResult> {
  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return listBoardsForAdmin();
}
