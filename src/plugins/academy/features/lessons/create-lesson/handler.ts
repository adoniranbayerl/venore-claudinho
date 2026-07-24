import { authorizeActor } from "@/contexts/rbac";
import { createLesson } from "./service";
import type { CreateLessonInput, CreateLessonResult } from "./types";

export async function createLessonHandler(input: CreateLessonInput): Promise<CreateLessonResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_course_id", message: "courseId não pode ser vazio." } };
  }

  if (input.cmsEntryId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_cms_entry_id", message: "cmsEntryId não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createLesson({ ...input, actorId: authz.actorId });
}
