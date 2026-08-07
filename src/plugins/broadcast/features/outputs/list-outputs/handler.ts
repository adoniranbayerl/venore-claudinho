import { authorizeActor } from "@/contexts/rbac";
import { listOutputs } from "./service";
import type { ListOutputsResult } from "./types";

export async function listOutputsHandler(): Promise<ListOutputsResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listOutputs();
}
