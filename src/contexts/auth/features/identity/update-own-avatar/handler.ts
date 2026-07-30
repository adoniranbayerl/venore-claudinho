import { getCurrentUserService } from "../../session/get-current-user/service";
import { updateOwnAvatar } from "./service";
import type { UpdateOwnAvatarInput, UpdateOwnAvatarResult } from "./types";

export async function updateOwnAvatarHandler(input: UpdateOwnAvatarInput): Promise<UpdateOwnAvatarResult> {
  const currentUser = await getCurrentUserService();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: {
        code: "auth.identity.unauthenticated",
        message: "É necessário estar autenticado para executar esta operação.",
      },
    };
  }

  return updateOwnAvatar({ actorId: currentUser.data.id, avatarMediaId: input.avatarMediaId });
}
