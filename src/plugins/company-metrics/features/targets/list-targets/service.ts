import type { TargetInputRecord, TargetWithInputs } from "../../../contracts/types";
import { findInputsForTargets, findTargets } from "./store";
import type { ListTargetsResult } from "./types";

export async function listTargets(filter: {
  sectorId?: string;
  sectorIds?: string[];
  includeArchived?: boolean;
}): Promise<ListTargetsResult> {
  const targetRows = await findTargets({
    sectorId: filter.sectorId,
    sectorIds: filter.sectorIds,
    includeArchived: filter.includeArchived ?? false,
  });

  const inputs = await findInputsForTargets(targetRows.map((target) => target.id));
  const inputsByTarget = new Map<string, TargetInputRecord[]>();
  for (const input of inputs) {
    const list = inputsByTarget.get(input.targetId) ?? [];
    list.push(input);
    inputsByTarget.set(input.targetId, list);
  }

  const data: TargetWithInputs[] = targetRows.map((target) => ({
    target,
    inputs: inputsByTarget.get(target.id) ?? [],
  }));

  return { success: true, data };
}
