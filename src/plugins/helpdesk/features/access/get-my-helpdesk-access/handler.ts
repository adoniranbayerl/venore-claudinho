import { authorizeActor } from "@/contexts/rbac";
import { buildAccessForActor } from "./service";
import type { GetMyHelpdeskAccessResult } from "./types";

// Resumo do que o ator corrente pode fazer no plugin — usado pela área admin (quais filas ele
// configura/atende). Aceita manage, work ou read.
export async function getMyHelpdeskAccessHandler(): Promise<GetMyHelpdeskAccessResult> {
  const [manage, work, read] = await Promise.all([
    authorizeActor("helpdesk.manage"),
    authorizeActor("helpdesk.work"),
    authorizeActor("helpdesk.read"),
  ]);

  if (!manage.authorized && !work.authorized && !read.authorized) {
    return { success: false, error: manage.error };
  }

  const actorId = manage.authorized ? manage.actorId : work.authorized ? work.actorId : read.authorized ? read.actorId : "";

  return {
    success: true,
    data: await buildAccessForActor(actorId, {
      canManageAll: manage.authorized,
      canReadAll: manage.authorized || read.authorized,
    }),
  };
}
