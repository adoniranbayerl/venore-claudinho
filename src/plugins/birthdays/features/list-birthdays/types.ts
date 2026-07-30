import type { OperationResult } from "@/shared/types";

export type BirthdayAdminView = {
  id: string;
  fullName: string;
  role: string | null;
  locality: string;
  month: number;
  day: number;
  createdByUserId: string | null;
  createdByName: string | null;
};

export type ListBirthdaysResult = OperationResult<BirthdayAdminView[]>;
