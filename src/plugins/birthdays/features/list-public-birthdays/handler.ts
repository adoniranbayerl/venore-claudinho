import { listPublicBirthdays } from "./service";
import type { ListPublicBirthdaysResult } from "./types";

// Sem authorizeActor de propósito — quadro de aniversários é público, sem autenticação (mesmo
// espírito de contexts/settings/features/get-setting/handler.ts).
export async function listPublicBirthdaysHandler(): Promise<ListPublicBirthdaysResult> {
  return listPublicBirthdays();
}
