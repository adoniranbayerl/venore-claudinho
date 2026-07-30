import { authorizeActor } from "@/contexts/rbac";
import { setExtensionEnabled } from "./service";
import type { SetExtensionEnabledInput, SetExtensionEnabledResult } from "./types";

export async function setExtensionEnabledHandler(input: SetExtensionEnabledInput): Promise<SetExtensionEnabledResult> {
  if (input.key.trim().length === 0) {
    return { success: false, error: { code: "extensions.set.invalid_key", message: "key não pode ser vazio." } };
  }

  const authz = await authorizeActor("platform.extensions.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setExtensionEnabled({ ...input, actorId: authz.actorId });
}
