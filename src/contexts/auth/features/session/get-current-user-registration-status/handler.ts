import { getCurrentUserRegistrationStatusService } from "./service";
import type { GetCurrentUserRegistrationStatusResult } from "./types";

export async function getCurrentUserRegistrationStatusHandler(): Promise<GetCurrentUserRegistrationStatusResult> {
  return getCurrentUserRegistrationStatusService();
}
