import type { OperationResult } from "@/shared/types";
import type { ProgramRecord } from "../../../contracts/types";

export type UpdateProgramCommand = {
  programId: string;
  label: string;
  groupLabel?: string | null;
  goal: number;
  renewed: number;
  newEnrollments: number;
  actorId: string;
};

export type UpdateProgramInput = Omit<UpdateProgramCommand, "actorId">;
export type UpdateProgramResult = OperationResult<ProgramRecord>;
