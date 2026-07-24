import { authorizeActor } from "../../../authorize-actor";
import { listPendingRegistrations } from "./service";
import type { ListPendingRegistrationsResult } from "./types";

export async function listPendingRegistrationsHandler(): Promise<ListPendingRegistrationsResult> {
  const authz = await authorizeActor("rbac.registrations.approve");
  if (!authz.authorized) return { success: false, error: authz.error };

  return listPendingRegistrations();
}
