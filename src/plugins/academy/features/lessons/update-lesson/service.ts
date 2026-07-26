import { getEntry } from "@/contexts/cms";
import { beginOperation, endOperation } from "@/observability";
import { findLessonById, updateLesson } from "./store";
import type { UpdateLessonCommand, UpdateLessonResult } from "./types";

export async function updateLessonService(command: UpdateLessonCommand): Promise<UpdateLessonResult> {
  const handle = beginOperation({
    useCase: "academy.update-lesson",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLessonById(command.id);
  if (!existing) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.cmsEntryId !== undefined && command.cmsEntryId !== existing.cmsEntryId) {
    const entry = await getEntry({ id: command.cmsEntryId });
    if (!entry.success || !entry.data) {
      const error = {
        code: "academy.lessons.invalid_cms_entry",
        message: `cmsEntryId "${command.cmsEntryId}" não corresponde a um entry existente.`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const lesson = await updateLesson(command.id, {
    cmsEntryId: command.cmsEntryId,
    videoUrl: command.videoUrl,
  });

  endOperation(handle, { success: true });
  return { success: true, data: lesson };
}
