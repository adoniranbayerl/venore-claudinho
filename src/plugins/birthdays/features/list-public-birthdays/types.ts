import type { OperationResult } from "@/shared/types";

export type PublicBirthdayView = {
  id: string;
  fullName: string;
  role: string | null;
  month: number;
  day: number;
};

export type ListPublicBirthdaysResult = OperationResult<PublicBirthdayView[]>;
