import { beginOperation, endOperation } from "@/observability";
import { deleteBirthdayById } from "./store";
import type { DeleteBirthdayCommand, DeleteBirthdayResult } from "./types";

export async function deleteBirthday(command: DeleteBirthdayCommand): Promise<DeleteBirthdayResult> {
  const handle = beginOperation({
    useCase: "birthdays.delete-birthday",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const deleted = await deleteBirthdayById(command.birthdayId);
  if (!deleted) {
    const error = {
      code: "birthdays.not_found",
      message: `Aniversariante "${command.birthdayId}" não encontrado.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  endOperation(handle, { success: true });
  return { success: true, data: { birthdayId: command.birthdayId } };
}
