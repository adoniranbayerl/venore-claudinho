import type { OperationResult } from "@/shared/types";
import type { BirthdayRecord } from "../../contracts/types";

export type UpdateBirthdayCommand = {
  birthdayId: string;
  fullName: string;
  role?: string | null;
  locality?: string;
  month: number;
  day: number;
  actorId: string;
};

export type UpdateBirthdayInput = Omit<UpdateBirthdayCommand, "actorId">;
export type UpdateBirthdayResult = OperationResult<BirthdayRecord>;
