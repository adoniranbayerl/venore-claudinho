import type { OperationResult } from "@/shared/types";
import type { StudentQuizQuestionRecord } from "../../../contracts/types";

export type ListQuizQuestionsForStudentQuery = { lessonId: string };
export type ListQuizQuestionsForStudentCommand = ListQuizQuestionsForStudentQuery & { actorId: string };
export type ListQuizQuestionsForStudentResult = OperationResult<StudentQuizQuestionRecord[]>;
