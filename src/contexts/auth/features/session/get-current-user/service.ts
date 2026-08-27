import { findAvatarMediaId, getSession } from "./store";
import { toAuthenticatedUser } from "./view";
import type { GetCurrentUserResult } from "./types";

export async function getCurrentUserService(): Promise<GetCurrentUserResult> {
  const session = await getSession();

  if (!session?.user) {
    return { success: true, data: null };
  }

  // P9 — sessão de usuário "pending" não autentica: trata como não autenticado em todo lugar que
  // resolve identidade (authorizeActor, gate de admin, handlers self-service), cobrindo Server
  // Actions e /api que o redirect de (platform)/layout.tsx não alcança. O status vem do callback
  // session de auth.config.ts.
  if (session.user.status === "pending") {
    return { success: true, data: null };
  }

  const avatarMediaId = await findAvatarMediaId(session.user.id);
  return { success: true, data: toAuthenticatedUser(session.user, avatarMediaId) };
}
