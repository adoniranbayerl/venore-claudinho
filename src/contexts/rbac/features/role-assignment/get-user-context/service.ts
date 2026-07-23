import { getCachedUserContext, setCachedUserContext } from "../../../user-context-cache";
import { findUserRoleRows } from "./store";
import { toUserRbacContext } from "./view";
import type { GetUserContextQuery, GetUserContextResult } from "./types";

export async function getUserContext(query: GetUserContextQuery): Promise<GetUserContextResult> {
  const cached = getCachedUserContext(query.userId);
  if (cached) {
    return { success: true, data: cached };
  }

  const rows = await findUserRoleRows(query.userId);
  const context = toUserRbacContext(query.userId, rows);

  setCachedUserContext(query.userId, context);

  return { success: true, data: context };
}
