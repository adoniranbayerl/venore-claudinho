import { findUserByEmailQuery } from "./service";
import type { FindUserByEmailQuery, FindUserByEmailResult } from "./types";

export async function findUserByEmailHandler(query: FindUserByEmailQuery): Promise<FindUserByEmailResult> {
  if (query.email.trim().length === 0) {
    return { success: false, error: { code: "auth.users.invalid_email", message: "email não pode ser vazio." } };
  }

  return findUserByEmailQuery(query);
}
