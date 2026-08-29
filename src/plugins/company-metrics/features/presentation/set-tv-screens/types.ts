import type { OperationResult } from "@/shared/types";
import type { TvScreenKind } from "../../../contracts/types";

export type TvScreenDraft = {
  kind: TvScreenKind;
  sectorId?: string | null;
  targetId?: string | null;
  definitionId?: string | null;
  dwellSeconds: number;
};

export type SetTvScreensCommand = { boardId: string; screens: TvScreenDraft[]; actorId: string };
export type SetTvScreensInput = Omit<SetTvScreensCommand, "actorId">;
export type SetTvScreensResult = OperationResult<{ boardId: string; screenCount: number }>;
