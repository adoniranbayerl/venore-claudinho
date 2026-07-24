import { beginOperation, endOperation } from "@/observability";
import { insertCourse } from "./store";
import type { CreateCourseCommand, CreateCourseResult } from "./types";

export async function createCourse(command: CreateCourseCommand): Promise<CreateCourseResult> {
  const handle = beginOperation({
    useCase: "academy.create-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const course = await insertCourse({
    title: command.title,
    description: command.description,
    selfEnrollmentEnabled: command.selfEnrollmentEnabled,
    publiclyListed: command.publiclyListed,
    createdBy: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
