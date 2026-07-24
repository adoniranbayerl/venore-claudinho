import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "../../../../infrastructure/cache/memory-cache";
import { upsertSetting } from "./store";
import type { SetSettingCommand, SetSettingResult } from "./types";

export async function setSetting(command: SetSettingCommand): Promise<SetSettingResult> {
  const handle = beginOperation({
    useCase: "settings.set-setting",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await upsertSetting(command.key, command.value);

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache).
  invalidateCache(`settings:${command.key}`);

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
