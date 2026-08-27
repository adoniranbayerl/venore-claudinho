import { authorizeActor } from "@/contexts/rbac";
import { setExtensionInstalled } from "./service";
import type { SetExtensionInstalledInput, SetExtensionInstalledResult } from "./types";

export async function setExtensionInstalledHandler(
  input: SetExtensionInstalledInput,
): Promise<SetExtensionInstalledResult> {
  if (input.key.trim().length === 0) {
    return { success: false, error: { code: "extensions.install.invalid_key", message: "key não pode ser vazio." } };
  }

  const authz = await authorizeActor("platform.extensions.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setExtensionInstalled({ ...input, actorId: authz.actorId });
}
