import { getCurrentUserService } from "./service";
import type { GetCurrentUserResult } from "./types";

export async function getCurrentUserHandler(): Promise<GetCurrentUserResult> {
  return getCurrentUserService();
}
