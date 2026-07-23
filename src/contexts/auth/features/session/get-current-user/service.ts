import { getSession } from "./store";
import { toAuthenticatedUser } from "./view";
import type { GetCurrentUserResult } from "./types";

export async function getCurrentUserService(): Promise<GetCurrentUserResult> {
  const session = await getSession();

  if (!session?.user) {
    return { success: true, data: null };
  }

  return { success: true, data: toAuthenticatedUser(session.user) };
}
