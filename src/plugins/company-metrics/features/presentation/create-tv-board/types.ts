import type { OperationResult } from "@/shared/types";
import type { TvBoardRecord } from "../../../contracts/types";

export type CreateTvBoardCommand = { label: string; actorId: string };
export type CreateTvBoardInput = Omit<CreateTvBoardCommand, "actorId">;
export type CreateTvBoardResult = OperationResult<TvBoardRecord>;
