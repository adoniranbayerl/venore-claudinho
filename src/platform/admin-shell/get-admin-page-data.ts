import { cache } from "react";
import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "@/contexts/rbac";
import type { AdminPageGate } from "./types";

// cache() memoiza por request: o layout único ((platform)/layout.tsx) chama isso pra montar a
// sidebar/gate geral, e cada página admin chama de novo pelo próprio loader "de seção" (regra 13
// — gate de página nunca é dispensado pelo menu já filtrado, docs/venore-docks.md). Sem
// memoização isso era 2 round-trips de sessão + RBAC por request em vez de 1 — mesmo padrão de
// resolve-active-theme.ts.
export const getAdminPageData = cache(async (): Promise<AdminPageGate> => {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { granted: false, reason: "unauthenticated" };
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  if (!context.success) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAdminAccess = context.data.isSuperadmin || context.data.permissions.includes("platform.admin.access");

  if (!hasAdminAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return {
    granted: true,
    actor: {
      id: currentUser.data.id,
      name: currentUser.data.name,
      email: currentUser.data.email,
      isSuperadmin: context.data.isSuperadmin,
      permissions: context.data.permissions,
    },
  };
});
