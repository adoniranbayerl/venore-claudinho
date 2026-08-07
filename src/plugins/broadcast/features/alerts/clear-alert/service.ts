import { expireActiveAlerts } from "./store";
import type { ClearAlertResult } from "./types";

export async function clearAlert(): Promise<ClearAlertResult> {
  const cleared = await expireActiveAlerts();
  return { success: true, data: { cleared } };
}
