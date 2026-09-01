import type { OperationResult } from "@/shared/types";
import type { KioskRecord } from "../../../contracts/types";

export type UpdateKioskCommand = {
  kioskId: string;
  label: string;
  queueId?: string | null;
  defaultLocation?: string | null;
  active: boolean;
  actorId: string;
};

export type UpdateKioskInput = Omit<UpdateKioskCommand, "actorId">;
export type UpdateKioskResult = OperationResult<KioskRecord>;
