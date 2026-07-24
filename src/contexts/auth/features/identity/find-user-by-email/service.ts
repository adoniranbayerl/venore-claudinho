import { findUserByEmail } from "./store";
import type { FindUserByEmailQuery, FindUserByEmailResult } from "./types";

export async function findUserByEmailQuery(query: FindUserByEmailQuery): Promise<FindUserByEmailResult> {
  const user = await findUserByEmail(query.email);
  if (!user) {
    return {
      success: false,
      error: { code: "auth.users.not_found", message: `Nenhum usuário encontrado com o email "${query.email}".` },
    };
  }

  return { success: true, data: user };
}
