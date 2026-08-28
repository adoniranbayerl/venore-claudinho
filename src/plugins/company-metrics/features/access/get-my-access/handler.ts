import { authorizeActor } from "@/contexts/rbac";
import { buildAccessForActor } from "./service";
import type { GetMyAccessResult } from "./types";

// Resumo do que o ator corrente pode fazer no plugin — usado pela área admin (quais setores ele
// configura/lança) e, na Fase 4, pela visualização interativa. Aceita manage, contribute ou read.
export async function getMyAccessHandler(): Promise<GetMyAccessResult> {
  const full = await authorizeActor("company-metrics.manage");
  if (full.authorized) {
    return { success: true, data: await buildAccessForActor(full.actorId, true) };
  }

  const scoped = await authorizeActor(["company-metrics.contribute", "company-metrics.read"]);
  if (!scoped.authorized) {
    return { success: false, error: scoped.error };
  }

  return { success: true, data: await buildAccessForActor(scoped.actorId, false) };
}
