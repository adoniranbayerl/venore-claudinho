import { provisionUser } from "./service";
import type { ProvisionUserCommand, ProvisionUserResult } from "./types";

export async function provisionUserHandler(command: ProvisionUserCommand): Promise<ProvisionUserResult> {
  return provisionUser(command);
}
