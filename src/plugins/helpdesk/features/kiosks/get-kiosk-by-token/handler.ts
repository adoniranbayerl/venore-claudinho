import { getKioskByToken } from "./service";
import type { GetKioskByTokenResult } from "./types";

// Sem authorizeActor de propósito — a página do quiosque abre por token, sem sessão (§2.5, mesmo
// espírito de get-output-state/verify-output-pin do broadcast).
export async function getKioskByTokenHandler(token: string): Promise<GetKioskByTokenResult> {
  return getKioskByToken(token);
}
