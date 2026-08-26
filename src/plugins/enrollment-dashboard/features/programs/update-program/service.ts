import { beginOperation, endOperation } from "@/observability";
import { applyProgramUpdate, findProgramById } from "./store";
import type { UpdateProgramCommand, UpdateProgramResult } from "./types";

export async function updateProgram(command: UpdateProgramCommand): Promise<UpdateProgramResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.update-program",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findProgramById(command.programId);
  if (!existing) {
    const error = { code: "enrollment-dashboard.program_not_found", message: "Turma/curso não encontrado." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applyProgramUpdate({
    id: command.programId,
    label: command.label.trim(),
    groupLabel: command.groupLabel?.trim() || null,
    goal: command.goal,
    renewed: command.renewed,
    newEnrollments: command.newEnrollments,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
