export type BirthdayRecord = {
  id: string;
  fullName: string;
  role: string | null;
  locality: string;
  month: number;
  day: number;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
