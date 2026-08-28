import { beginOperation, endOperation } from "@/observability";
import { validateTargetCoreFields } from "../shared/target-input";
import { definitionIdsInSector, findTargetById, groupBelongsToSector, updateTargetWithInputs } from "./store";
import type { UpdateTargetCommand, UpdateTargetResult } from "./types";

export async function updateTarget(command: UpdateTargetCommand): Promise<UpdateTargetResult> {
  const existing = await findTargetById(command.targetId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.update-target.not_found", message: "Meta não encontrada." } };
  }

  const validationError = validateTargetCoreFields({
    label: command.label,
    targetValue: command.targetValue,
    periodStart: command.periodStart,
    periodEnd: command.periodEnd,
    onTrackThreshold: command.onTrackThreshold,
    inputs: command.inputs,
  });
  if (validationError) {
    return { success: false, error: validationError };
  }

  const groupId = command.groupId?.trim() || null;
  if (groupId && !(await groupBelongsToSector(groupId, existing.sectorId))) {
    return { success: false, error: { code: "company-metrics.update-target.group_mismatch", message: "O grupo escolhido não é deste setor." } };
  }

  const allowed = await definitionIdsInSector(
    existing.sectorId,
    command.inputs.map((input) => input.definitionId),
  );
  if (command.inputs.some((input) => !allowed.has(input.definitionId))) {
    return { success: false, error: { code: "company-metrics.update-target.input_foreign_definition", message: "Uma métrica da composição não é deste setor." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.update-target",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateTargetWithInputs(
    command.targetId,
    {
      groupId,
      label: command.label.trim(),
      description: command.description?.trim() || null,
      targetValue: command.targetValue,
      periodStart: command.periodStart,
      periodEnd: command.periodEnd,
      onTrackThreshold: command.onTrackThreshold,
    },
    command.inputs,
  );

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
