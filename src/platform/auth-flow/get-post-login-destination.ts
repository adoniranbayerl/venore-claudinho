import { getCurrentUser, getCurrentUserRegistrationStatus } from "@/contexts/auth";
import { getUserContext, superadminExists } from "@/contexts/rbac";

export type PostLoginDestination = "/login" | "/setup" | "/pending-approval" | "/admin" | "/";

export async function getPostLoginDestination(): Promise<PostLoginDestination> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return "/login";
  }

  const existsResult = await superadminExists();
  if (!existsResult.success || !existsResult.data) {
    return "/setup";
  }

  const statusResult = await getCurrentUserRegistrationStatus();
  if (statusResult.success && statusResult.data === "pending") {
    return "/pending-approval";
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  const hasAdminAccess =
    context.success && (context.data.isSuperadmin || context.data.permissions.includes("platform.admin.access"));

  return hasAdminAccess ? "/admin" : "/";
}
