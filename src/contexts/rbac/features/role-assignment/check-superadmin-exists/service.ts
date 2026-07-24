import { superadminAssignmentExists } from "./store";
import type { CheckSuperadminExistsResult } from "./types";

export async function checkSuperadminExists(): Promise<CheckSuperadminExistsResult> {
  const exists = await superadminAssignmentExists();
  return { success: true, data: exists };
}
