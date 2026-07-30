// Leitura pública (sem authorizeActor): só devolve uma contagem, nunca identidade de usuário —
// usada por platform/plugin-engine para montar o texto de confirmação de "desabilitar plugin"
// (docs/venore-docks.md — interface exige enumerar consequências reais antes de aplicar).
import { countUsersWithPermissions } from "./service";
import type { CountUsersWithPermissionsQuery, CountUsersWithPermissionsResult } from "./types";

export async function countUsersWithPermissionsHandler(
  query: CountUsersWithPermissionsQuery,
): Promise<CountUsersWithPermissionsResult> {
  return countUsersWithPermissions(query);
}
