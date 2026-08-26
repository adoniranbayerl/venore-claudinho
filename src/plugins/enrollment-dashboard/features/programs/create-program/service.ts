import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { institutionExists, insertProgram, nextProgramPosition, programKeyExists } from "./store";
import type { CreateProgramCommand, CreateProgramResult } from "./types";

// Key só precisa ser única dentro da instituição (schema/index.ts — programs_institution_key_idx),
// nunca reexposta pra edição (mesmo racional de create-institution/service.ts).
async function uniqueProgramKey(institutionId: string, label: string): Promise<string> {
  const base = slugify(label) || "turma";
  let candidate = base;
  let attempt = 1;
  while (await programKeyExists(institutionId, candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createProgram(command: CreateProgramCommand): Promise<CreateProgramResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.create-program",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  if (!(await institutionExists(command.institutionId))) {
    const error = { code: "enrollment-dashboard.institution_not_found", message: "Instituição não encontrada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const [key, position] = await Promise.all([
    uniqueProgramKey(command.institutionId, command.label),
    nextProgramPosition(command.institutionId),
  ]);

  const record = await insertProgram({
    institutionId: command.institutionId,
    key,
    label: command.label.trim(),
    groupLabel: command.groupLabel?.trim() || null,
    goal: command.goal,
    renewed: command.renewed,
    newEnrollments: command.newEnrollments,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
