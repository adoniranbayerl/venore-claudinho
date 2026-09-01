import type { OperationResult } from "@/shared/types";
import type { PracticeStreak } from "../../../shared/practice-streak";

export type GetPracticeStreakQuery = { actorId: string };
// Sem input do chamador — o ator vem sempre da sessão (handler).
export type GetPracticeStreakInput = Record<string, never>;
export type PracticeStreakView = PracticeStreak;
export type GetPracticeStreakResult = OperationResult<PracticeStreakView>;
