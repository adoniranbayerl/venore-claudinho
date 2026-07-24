import { checkSuperadminExists } from "./service";
import type { CheckSuperadminExistsResult } from "./types";

export async function checkSuperadminExistsHandler(): Promise<CheckSuperadminExistsResult> {
  return checkSuperadminExists();
}
