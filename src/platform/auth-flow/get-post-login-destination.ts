import { getCurrentUser } from "@/contexts/auth";
import { getUserContext, superadminExists } from "@/contexts/rbac";

export type PostLoginDestination = "/login" | "/setup" | "/admin" | "/";

export async function getPostLoginDestination(): Promise<PostLoginDestination> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return "/login";
  }

  const existsResult = await superadminExists();
  if (!existsResult.success || !existsResult.data) {
    return "/setup";
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  const hasAdminAccess =
    context.success && (context.data.isSuperadmin || context.data.permissions.includes("platform.admin.access"));

  return hasAdminAccess ? "/admin" : "/";
}
