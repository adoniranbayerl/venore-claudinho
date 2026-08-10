import { authorizeActor } from "@/contexts/rbac";
import { listOutputEditors } from "./service";
import type { ListOutputEditorsResult } from "./types";

export async function listOutputEditorsHandler(): Promise<ListOutputEditorsResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listOutputEditors();
}
