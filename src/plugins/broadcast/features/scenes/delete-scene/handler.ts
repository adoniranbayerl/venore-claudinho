import { authorizeActor } from "@/contexts/rbac";
import { deleteScene } from "./service";
import type { DeleteSceneInput, DeleteSceneResult } from "./types";

export async function deleteSceneHandler(input: DeleteSceneInput): Promise<DeleteSceneResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteScene(input);
}
