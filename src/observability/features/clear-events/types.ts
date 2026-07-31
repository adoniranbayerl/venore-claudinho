import type { OperationResult } from "@/shared/types";
import type { ActorRef } from "../../contracts/types";

export type ClearEventsCommand = {
  actor: ActorRef;
  confirmed?: boolean;
};

export type ClearEventsResult = OperationResult<{ cleared: number }>;
