import { getSession } from "../get-current-user/store";
import { findUserStatusById } from "./store";
import type { GetCurrentUserRegistrationStatusResult } from "./types";

export async function getCurrentUserRegistrationStatusService(): Promise<GetCurrentUserRegistrationStatusResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: true, data: null };
  }

  const status = await findUserStatusById(session.user.id);
  return { success: true, data: status };
}
