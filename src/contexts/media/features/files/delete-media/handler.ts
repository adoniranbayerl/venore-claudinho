import { authorizeActor } from "@/contexts/rbac";
import { deleteMedia } from "./service";
import type { DeleteMediaInput, DeleteMediaResult } from "./types";

export async function deleteMediaHandler(input: DeleteMediaInput): Promise<DeleteMediaResult> {
  if (input.id.trim().length === 0) {
    return {
      success: false,
      error: { code: "media.delete.invalid_id", message: "O id do arquivo não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteMedia({ ...input, actorId: authz.actorId });
}
