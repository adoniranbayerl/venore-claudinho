import type { OperationResult } from "@/shared/types";

export type ListQuizProgressForCourseQuery = { courseId: string };

export type QuizProgressEntryView = {
  studentActorId: string;
  studentName: string | null;
  studentEmail: string | null;
  lessonId: string;
  lessonPosition: number;
  quizMaxAttempts: number;
  attemptsUsed: number;
  exhausted: boolean;
};

export type ListQuizProgressForCourseResult = OperationResult<QuizProgressEntryView[]>;
