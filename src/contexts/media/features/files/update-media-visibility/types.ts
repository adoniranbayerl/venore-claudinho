import type { OperationResult } from "@/shared/types";
import type { MediaRecord, MediaVisibility } from "../../../contracts/types";

export type UpdateMediaVisibilityCommand = { id: string; visibility: MediaVisibility; actorId: string; isMediaAdmin: boolean };
export type UpdateMediaVisibilityInput = { id: string; visibility: MediaVisibility };
export type UpdateMediaVisibilityResult = OperationResult<MediaRecord>;
