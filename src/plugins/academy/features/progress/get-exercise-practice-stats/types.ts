import type { OperationResult } from "@/shared/types";
import type { ExercisePracticeStats } from "../../../shared/exercise-practice-store";

export type GetExercisePracticeStatsInput = { exerciseKey: string };
export type GetExercisePracticeStatsResult = OperationResult<ExercisePracticeStats>;
