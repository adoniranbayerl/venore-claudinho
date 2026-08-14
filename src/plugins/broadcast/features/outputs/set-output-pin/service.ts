import { beginOperation, endOperation } from "@/observability";
import { applyOutputPin, findOutputById } from "./store";
import type { SetOutputPinCommand, SetOutputPinResult } from "./types";

// Sem publishOutputEvent — diferente de drawer/footer/ticker, o PIN não faz parte de
// BroadcastOutputState (nunca deve ser serializado pro browser, ver contracts/types.ts), então não
// há nada pra sincronizar em tempo real com a view de saída.
export async function setOutputPin(command: SetOutputPinCommand): Promise<SetOutputPinResult> {
  const output = await findOutputById(command.outputId);
  if (!output) {
    return { success: false, error: { code: "broadcast.set-output-pin.not_found", message: "Saída não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "broadcast.set-output-pin",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await applyOutputPin({ id: command.outputId, pin: command.pin });

  endOperation(handle, { success: true });

  return { success: true, data: record };
}
