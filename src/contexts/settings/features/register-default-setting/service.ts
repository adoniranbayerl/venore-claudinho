import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "../../../../infrastructure/cache/memory-cache";
import { insertSettingIfMissing } from "./store";
import type { RegisterDefaultSettingInput, RegisterDefaultSettingResult } from "./types";

export async function registerDefaultSetting(command: RegisterDefaultSettingInput): Promise<RegisterDefaultSettingResult> {
  const handle = beginOperation({
    useCase: "settings.register-default-setting",
    actor: { id: "system", type: "system" },
    kind: "write",
  });

  const registered = await insertSettingIfMissing(command.key, command.value);

  // Só invalida se de fato gravou — chave já existente (default ou valor de admin) não muda.
  if (registered) {
    invalidateCache(`settings:${command.key}`);
  }

  endOperation(handle, { success: true });
  return { success: true, data: { key: command.key, registered } };
}
