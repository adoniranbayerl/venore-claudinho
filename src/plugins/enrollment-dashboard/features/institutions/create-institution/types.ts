import type { OperationResult } from "@/shared/types";
import type { InstitutionRecord } from "../../../contracts/types";

export type CreateInstitutionCommand = {
  name: string;
  programLabel: string;
  logoMediaId?: string | null;
  actorId: string;
};

export type CreateInstitutionInput = Omit<CreateInstitutionCommand, "actorId">;
export type CreateInstitutionResult = OperationResult<InstitutionRecord>;
