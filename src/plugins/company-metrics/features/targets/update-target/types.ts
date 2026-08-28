import type { OperationResult } from "@/shared/types";
import type { TargetRecord } from "../../../contracts/types";
import type { TargetInputDraft } from "../shared/target-input";

export type UpdateTargetCommand = {
  targetId: string;
  groupId?: string | null;
  label: string;
  description?: string | null;
  targetValue: number;
  periodStart: string;
  periodEnd: string;
  onTrackThreshold: number;
  inputs: TargetInputDraft[];
  actorId: string;
};

export type UpdateTargetInput = Omit<UpdateTargetCommand, "actorId">;
export type UpdateTargetResult = OperationResult<TargetRecord>;
