import { getUserContext } from "./service";
import type { GetUserContextQuery, GetUserContextResult } from "./types";

export async function getUserContextHandler(query: GetUserContextQuery): Promise<GetUserContextResult> {
  if (query.userId.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." },
    };
  }

  return getUserContext(query);
}
