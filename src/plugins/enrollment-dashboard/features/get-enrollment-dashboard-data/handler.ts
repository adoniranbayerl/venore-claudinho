import { getEnrollmentDashboardData } from "./service";
import type { GetEnrollmentDashboardDataResult } from "./types";

// Sem authorizeActor de propósito — mesmo racional de get-presentation-access/handler.ts: este
// dado é lido tanto pela tela admin (já protegida pelo gate de página, enrollment-dashboard.read)
// quanto pela view pública de apresentação, sem sessão (acesso só por token na URL).
export async function getEnrollmentDashboardDataHandler(): Promise<GetEnrollmentDashboardDataResult> {
  return getEnrollmentDashboardData();
}
