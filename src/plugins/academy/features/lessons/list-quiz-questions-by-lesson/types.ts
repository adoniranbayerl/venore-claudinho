import type { OperationResult } from "@/shared/types";
import type { QuizQuestionRecord } from "../../../contracts/types";

export type ListQuizQuestionsByLessonQuery = { lessonId: string };
export type ListQuizQuestionsByLessonResult = OperationResult<QuizQuestionRecord[]>;
