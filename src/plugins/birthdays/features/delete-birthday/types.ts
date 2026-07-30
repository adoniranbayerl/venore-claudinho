import type { OperationResult } from "@/shared/types";

export type DeleteBirthdayCommand = { birthdayId: string; actorId: string };
export type DeleteBirthdayInput = { birthdayId: string };
export type DeleteBirthdayResult = OperationResult<{ birthdayId: string }>;
