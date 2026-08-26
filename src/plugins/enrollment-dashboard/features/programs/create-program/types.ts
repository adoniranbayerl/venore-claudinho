import type { OperationResult } from "@/shared/types";
import type { ProgramRecord } from "../../../contracts/types";

export type CreateProgramCommand = {
  institutionId: string;
  label: string;
  groupLabel?: string | null;
  goal: number;
  renewed: number;
  newEnrollments: number;
  actorId: string;
};

export type CreateProgramInput = Omit<CreateProgramCommand, "actorId">;
export type CreateProgramResult = OperationResult<ProgramRecord>;
