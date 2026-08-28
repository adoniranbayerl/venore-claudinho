import { beginOperation, endOperation } from "@/observability";
import { validateTargetCoreFields } from "../shared/target-input";
import { definitionIdsInSector, groupBelongsToSector, insertTargetWithInputs, nextTargetPosition, sectorExists } from "./store";
import type { CreateTargetCommand, CreateTargetResult } from "./types";

export async function createTarget(command: CreateTargetCommand): Promise<CreateTargetResult> {
  const onTrackThreshold = command.onTrackThreshold ?? 0.85;

  const validationError = validateTargetCoreFields({
    label: command.label,
    targetValue: command.targetValue,
    periodStart: command.periodStart,
    periodEnd: command.periodEnd,
    onTrackThreshold,
    inputs: command.inputs,
  });
  if (validationError) {
    return { success: false, error: validationError };
  }

  if (!(await sectorExists(command.sectorId))) {
    return { success: false, error: { code: "company-metrics.create-target.sector_not_found", message: "Setor não encontrado." } };
  }

  const groupId = command.groupId?.trim() || null;
  if (groupId && !(await groupBelongsToSector(groupId, command.sectorId))) {
    return { success: false, error: { code: "company-metrics.create-target.group_mismatch", message: "O grupo escolhido não é deste setor." } };
  }

  const allowed = await definitionIdsInSector(
    command.sectorId,
    command.inputs.map((input) => input.definitionId),
  );
  if (command.inputs.some((input) => !allowed.has(input.definitionId))) {
    return { success: false, error: { code: "company-metrics.create-target.input_foreign_definition", message: "Uma métrica da composição não é deste setor." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.create-target",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const position = await nextTargetPosition(command.sectorId);
  const record = await insertTargetWithInputs(
    {
      sectorId: command.sectorId,
      groupId,
      label: command.label.trim(),
      description: command.description?.trim() || null,
      targetValue: command.targetValue,
      periodStart: command.periodStart,
      periodEnd: command.periodEnd,
      onTrackThreshold,
      position,
    },
    command.inputs,
  );

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
