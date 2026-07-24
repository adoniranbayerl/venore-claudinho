import { findAllUsers } from "./store";
import type { ListUsersResult, UserRef } from "./types";

export async function listUsers(): Promise<ListUsersResult> {
  const rows = await findAllUsers();
  return { success: true, data: rows as UserRef[] };
}
