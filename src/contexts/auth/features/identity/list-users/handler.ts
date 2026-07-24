import { listUsers } from "./service";
import type { ListUsersResult } from "./types";

export async function listUsersHandler(): Promise<ListUsersResult> {
  return listUsers();
}
