import type { OperationResult } from "@/shared/types";

export type ListActivitySubmissionMediaForCourseQuery = { courseId: string };

export type ActivitySubmissionMediaItem = {
  mediaId: string;
  submissionId: string;
  lessonId: string;
  lessonPosition: number;
  lessonTitle: string;
};

export type ListActivitySubmissionMediaForCourseResult = OperationResult<ActivitySubmissionMediaItem[]>;
