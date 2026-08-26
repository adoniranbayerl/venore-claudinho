import type { OperationResult } from "@/shared/types";
import type { EnrollmentInstitution } from "../../contracts/types";

export type GetEnrollmentDashboardDataResult = OperationResult<EnrollmentInstitution[]>;
