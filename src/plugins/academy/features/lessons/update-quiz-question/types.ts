import type { OperationResult } from "@/shared/types";
import type { QuizQuestionRecord } from "../../../contracts/types";

export type UpdateQuizQuestionCommand = {
  id: string;
  text?: string;
  options?: string[];
  correctOptionIndex?: number;
  actorId: string;
};
export type UpdateQuizQuestionInput = Omit<UpdateQuizQuestionCommand, "actorId">;
export type UpdateQuizQuestionResult = OperationResult<QuizQuestionRecord>;
