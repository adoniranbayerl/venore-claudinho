import type { OperationResult } from "@/shared/types";
import type { KioskRecord } from "../../../contracts/types";

export type KioskListItem = KioskRecord & { queueName: string | null };

export type ListKiosksResult = OperationResult<{
  kiosks: KioskListItem[];
  // Filas ativas para o seletor de "fila fixada" no formulário do quiosque.
  queueOptions: { id: string; name: string }[];
}>;
