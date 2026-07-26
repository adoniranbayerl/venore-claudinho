import { authorizeActor } from "@/contexts/rbac";
import { updateLessonService } from "./service";
import type { UpdateLessonInput, UpdateLessonResult } from "./types";

export async function updateLessonHandler(input: UpdateLessonInput): Promise<UpdateLessonResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "id não pode ser vazio." } };
  }

  if (input.cmsEntryId !== undefined && input.cmsEntryId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lessons.invalid_cms_entry_id", message: "cmsEntryId não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateLessonService({ ...input, actorId: authz.actorId });
}
