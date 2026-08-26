import type { OperationResult } from "@/shared/types";
import type { InstitutionRecord } from "../../../contracts/types";

export type UpdateInstitutionCommand = {
  institutionId: string;
  name: string;
  programLabel: string;
  logoMediaId?: string | null;
  actorId: string;
};

export type UpdateInstitutionInput = Omit<UpdateInstitutionCommand, "actorId">;
export type UpdateInstitutionResult = OperationResult<InstitutionRecord>;
