import { beginOperation, endOperation } from "@/observability";
import { applyCourseSettings, findCourseById } from "./store";
import type { UpdateCourseSettingsCommand, UpdateCourseSettingsResult } from "./types";

export async function updateCourseSettings(command: UpdateCourseSettingsCommand): Promise<UpdateCourseSettingsResult> {
  const handle = beginOperation({
    useCase: "academy.update-course-settings",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCourseById(command.id);
  if (!existing) {
    const error = { code: "academy.courses.not_found", message: `Course "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const course = await applyCourseSettings({
    id: command.id,
    selfEnrollmentEnabled: command.selfEnrollmentEnabled,
    publiclyListed: command.publiclyListed,
  });

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
