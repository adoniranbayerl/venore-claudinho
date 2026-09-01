import { getTicketByTrackingToken } from "./service";
import type { GetTicketByTrackingTokenResult } from "./types";

// Sem authorizeActor de propósito (§2.5) — acesso pelo tracking token, sem sessão.
export async function getTicketByTrackingTokenHandler(
  trackingToken: string,
): Promise<GetTicketByTrackingTokenResult> {
  return getTicketByTrackingToken(trackingToken);
}
