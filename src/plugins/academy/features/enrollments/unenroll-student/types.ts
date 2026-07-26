import type { OperationResult } from "@/shared/types";
import type { EnrollmentRecord } from "../../../contracts/types";

export type UnenrollStudentCommand = { courseId: string; studentActorId: string; actorId: string };
export type UnenrollStudentInput = Omit<UnenrollStudentCommand, "actorId">;
export type UnenrollStudentResult = OperationResult<EnrollmentRecord>;
