import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "@/contexts/rbac";
import type { AdminPageGate } from "./types";

export async function getAdminPageData(): Promise<AdminPageGate> {
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
}
