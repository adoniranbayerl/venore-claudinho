"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY } from "@/platform/registration/handle-user-registered";

export type SettingsActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function updateRegistrationApprovalAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const enabled = formData.get("enabled") === "on";

  const result = await setSetting({
    key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY,
    value: enabled ? "true" : "false",
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/settings");
  return { error: null };
}
