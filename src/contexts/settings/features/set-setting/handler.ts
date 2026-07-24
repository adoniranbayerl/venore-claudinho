import { authorizeActor } from "@/contexts/rbac";
import { setSetting } from "./service";
import type { SetSettingInput, SetSettingResult } from "./types";

export async function setSettingHandler(input: SetSettingInput): Promise<SetSettingResult> {
  if (input.key.trim().length === 0) {
    return { success: false, error: { code: "settings.set.invalid_key", message: "key não pode ser vazio." } };
  }

  const authz = await authorizeActor("settings.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setSetting({ ...input, actorId: authz.actorId });
}
