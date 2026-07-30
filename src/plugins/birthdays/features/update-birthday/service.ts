import { beginOperation, endOperation } from "@/observability";
import { applyBirthdayUpdate, findBirthdayById } from "./store";
import type { UpdateBirthdayCommand, UpdateBirthdayResult } from "./types";

export async function updateBirthday(command: UpdateBirthdayCommand): Promise<UpdateBirthdayResult> {
  const handle = beginOperation({
    useCase: "birthdays.update-birthday",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findBirthdayById(command.birthdayId);
  if (!existing) {
    const error = {
      code: "birthdays.not_found",
      message: `Aniversariante "${command.birthdayId}" não encontrado.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applyBirthdayUpdate({
    id: command.birthdayId,
    fullName: command.fullName.trim(),
    role: command.role?.trim() || null,
    locality: command.locality?.trim() || "Matriz",
    month: command.month,
    day: command.day,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
