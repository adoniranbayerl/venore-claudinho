import type { OperationResult } from "@/shared/types";
import type { QuizQuestionRecord } from "../../../contracts/types";

export type AddQuizQuestionCommand = {
  lessonId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  actorId: string;
};
export type AddQuizQuestionInput = Omit<AddQuizQuestionCommand, "actorId">;
export type AddQuizQuestionResult = OperationResult<QuizQuestionRecord>;
