import { getMedia } from "@/contexts/media";
import { beginOperation, endOperation } from "@/observability";
import { updateAvatarMediaId } from "./store";
import type { UpdateOwnAvatarCommand, UpdateOwnAvatarResult } from "./types";

export async function updateOwnAvatar(command: UpdateOwnAvatarCommand): Promise<UpdateOwnAvatarResult> {
  const handle = beginOperation({
    useCase: "auth.update-own-avatar",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  if (command.avatarMediaId) {
    const media = await getMedia({ id: command.avatarMediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "auth.identity.invalid_avatar_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.avatarMediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const updated = await updateAvatarMediaId(command.actorId, command.avatarMediaId);

  endOperation(handle, { success: true });
  return { success: true, data: updated };
}
