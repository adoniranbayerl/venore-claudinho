import { authorizeActor } from "@/contexts/rbac";
import { listKiosksForAdmin } from "./service";
import type { ListKiosksResult } from "./types";

// Aba Quiosques do admin (§2.5) — só `helpdesk.manage`.
export async function listKiosksHandler(): Promise<ListKiosksResult> {
  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return listKiosksForAdmin();
}
