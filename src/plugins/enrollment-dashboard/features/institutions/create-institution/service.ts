import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { insertInstitution, institutionKeyExists, nextInstitutionPosition } from "./store";
import type { CreateInstitutionCommand, CreateInstitutionResult } from "./types";

// Key gerada do nome e nunca reexposta pra edição (update-institution não mexe nela) — ela vira
// parte da URL de apresentação (present/[token]/[institutionKey]), então trocar depois de criada
// quebraria um link já compartilhado/projetado. Sufixo numérico só resolve colisão (duas
// instituições com nome igual/parecido), não é rota normal.
async function uniqueInstitutionKey(name: string): Promise<string> {
  const base = slugify(name) || "instituicao";
  let candidate = base;
  let attempt = 1;
  while (await institutionKeyExists(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createInstitution(command: CreateInstitutionCommand): Promise<CreateInstitutionResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.create-institution",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([uniqueInstitutionKey(command.name), nextInstitutionPosition()]);

  const record = await insertInstitution({
    key,
    name: command.name.trim(),
    logoMediaId: command.logoMediaId?.trim() || null,
    programLabel: command.programLabel.trim(),
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
