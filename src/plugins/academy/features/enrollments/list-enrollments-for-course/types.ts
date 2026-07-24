import type { OperationResult } from "@/shared/types";

export type ListEnrollmentsForCourseQuery = { courseId: string };

export type EnrollmentView = {
  actorId: string;
  name: string | null;
  email: string | null;
  enrolledAt: Date;
  enrolledBy: string;
};

export type ListEnrollmentsForCourseResult = OperationResult<EnrollmentView[]>;
