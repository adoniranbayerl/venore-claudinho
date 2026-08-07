import { authorizeActor } from "@/contexts/rbac";
import { clearAlert } from "./service";
import type { ClearAlertResult } from "./types";

export async function clearAlertHandler(): Promise<ClearAlertResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return clearAlert();
}
