import type { OperationResult } from "@/shared/types";
import type { QuizAnswer } from "../../../contracts/types";

export type SubmitQuizAttemptCommand = { lessonId: string; answers: QuizAnswer[]; actorId: string };
export type SubmitQuizAttemptInput = Omit<SubmitQuizAttemptCommand, "actorId">;
export type SubmitQuizAttemptResult = OperationResult<{
  attemptNumber: number;
  score: number;
  passed: boolean;
  attemptsRemaining: number;
}>;
