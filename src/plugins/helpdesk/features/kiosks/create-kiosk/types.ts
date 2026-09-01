import type { OperationResult } from "@/shared/types";
import type { KioskRecord } from "../../../contracts/types";

export type CreateKioskCommand = {
  label: string;
  // null = o solicitante escolhe a fila no formulário do quiosque.
  queueId?: string | null;
  defaultLocation?: string | null;
  actorId: string;
};

export type CreateKioskInput = Omit<CreateKioskCommand, "actorId">;
export type CreateKioskResult = OperationResult<KioskRecord>;
