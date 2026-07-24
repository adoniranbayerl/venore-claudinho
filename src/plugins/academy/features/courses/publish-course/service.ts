import { beginOperation, endOperation } from "@/observability";
import { findCourseById, markCoursePublished } from "./store";
import type { PublishCourseCommand, PublishCourseResult } from "./types";

export async function publishCourse(command: PublishCourseCommand): Promise<PublishCourseResult> {
  const handle = beginOperation({
    useCase: "academy.publish-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCourseById(command.id);
  if (!existing) {
    const error = { code: "academy.courses.not_found", message: `Course "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const course = await markCoursePublished(command.id);

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
