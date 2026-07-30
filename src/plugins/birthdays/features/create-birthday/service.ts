import { beginOperation, endOperation } from "@/observability";
import { insertBirthday } from "./store";
import type { CreateBirthdayCommand, CreateBirthdayResult } from "./types";

export async function createBirthday(command: CreateBirthdayCommand): Promise<CreateBirthdayResult> {
  const handle = beginOperation({
    useCase: "birthdays.create-birthday",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertBirthday({
    fullName: command.fullName.trim(),
    role: command.role?.trim() || null,
    locality: command.locality?.trim() || "Matriz",
    month: command.month,
    day: command.day,
    createdByUserId: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
